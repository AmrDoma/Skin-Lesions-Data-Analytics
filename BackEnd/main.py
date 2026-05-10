from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import get_db, engine, Base
import models
import schemas
import auth
from services import ChatbotService, CloudinaryService, classify_base64_image

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/signup/", status_code=201)
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    if user.password != user.password2:
        raise HTTPException(status_code=400, detail={"password": ["Password fields didn't match."]})
    
    db_user = db.query(models.User).filter((models.User.username == user.username) | (models.User.email == user.email)).first()
    if db_user:
        raise HTTPException(status_code=400, detail={"username": ["Username or email already registered"]})
        
    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(username=user.username, email=user.email, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # create token
    new_token = models.Token(user_id=new_user.id)
    db.add(new_token)
    db.commit()
    db.refresh(new_token)
    
    return {"token": new_token.key, "user_id": new_user.id, "email": new_user.email}


@app.post("/api/login/")
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if not db_user or not auth.verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail={"error": "Invalid Credentials"})
        
    db_token = db.query(models.Token).filter(models.Token.user_id == db_user.id).first()
    if not db_token:
        db_token = models.Token(user_id=db_user.id)
        db.add(db_token)
        db.commit()
        db.refresh(db_token)
        
    return {"token": db_token.key, "user_id": db_user.id, "email": db_user.email}


@app.post("/api/chat/", response_model=schemas.ChatResponse)
def chat(request: schemas.ChatRequest, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    user_msg = models.Message(text=request.message, sender_type='user', user_id=current_user.id)
    db.add(user_msg)
    db.commit()
    db.refresh(user_msg)
    
    past_messages = db.query(models.Message).filter(models.Message.user_id == current_user.id).order_by(models.Message.timestamp).all()
    chat_history = [{"text": m.text, "sender_type": m.sender_type} for m in past_messages]
    
    ai_text = ChatbotService.get_ai_response(chat_history)
    
    ai_msg = models.Message(text=ai_text, sender_type='ai', user_id=current_user.id)
    db.add(ai_msg)
    db.commit()
    db.refresh(ai_msg)
    
    return {"user_message": user_msg, "ai_response": ai_msg}


@app.post("/api/upload-image/", status_code=201)
def upload_image(request: schemas.ImageUploadRequest, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    upload_result = CloudinaryService.upload_base64_image(request.image)
    if upload_result['success']:
        image = models.Image(media_link=upload_result['url'], user_id=current_user.id)
        
        result = classify_base64_image(request.image)
        class_names = ["AKIEC", "BCC", "BKL", "DF", "MEL", "NV", "VASC"]
        probs = result.get("classes", [])
        prob_map = dict(zip(class_names, probs)) if probs else {}
        top_idx = max(range(len(probs)), key=lambda i: probs[i]) if probs else None
        predicted = class_names[top_idx] if top_idx is not None else None
        
        image.predicted_class = predicted
        image.probabilities = prob_map
        db.add(image)
        db.commit()
        db.refresh(image)
        
        return {
            "id": image.id,
            "media_link": image.media_link,
            "uploaded_at": image.uploaded_at,
            "predicted_class": image.predicted_class,
            "probabilities": image.probabilities
        }
    else:
        raise HTTPException(status_code=500, detail={"error": "Failed to upload image to Cloudinary", "details": upload_result.get('error', 'Unknown error')})


@app.get("/api/my-images/", response_model=list[schemas.ImageResponse])
def my_images(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    images = db.query(models.Image).filter(models.Image.user_id == current_user.id).order_by(models.Image.uploaded_at.desc()).all()
    return images


@app.post("/api/classify-image/", status_code=201)
def classify_image(request: schemas.ImageUploadRequest, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    # In the original code, this was functionally identical to upload_image but it used ImageClassifySerializer
    return upload_image(request, db, current_user)


@app.delete("/api/delete-image/{image_id}/")
def delete_image(image_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    image = db.query(models.Image).filter(models.Image.id == image_id, models.Image.user_id == current_user.id).first()
    if not image:
        raise HTTPException(status_code=404, detail={"error": "Image not found or you do not have permission to delete it."})
    
    db.delete(image)
    db.commit()
    return {"message": "Image deleted successfully."}
