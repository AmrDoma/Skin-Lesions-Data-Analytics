import os
import logging
import requests
import json
import base64
import io
import uuid
import numpy as np
from PIL import Image
from dotenv import load_dotenv
from pathlib import Path
from together import Together
import cloudinary
import cloudinary.uploader

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

client = Together()

cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME', 'your_cloud_name'),
    api_key=os.getenv('CLOUDINARY_API_KEY', 'your_api_key'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET', 'your_api_secret'),
    secure=True
)

class ChatbotService:
    @staticmethod
    def get_ai_response(chat_history):      
        try:
            formatted_chat_history = []
            
            for message in chat_history:
                if "text" in message and "sender_type" in message:
                    if message["sender_type"] == "user":
                        role = "user"
                    elif message["sender_type"] == "ai":
                        role = "system"
                    else:
                        role = "system"
                    
                    formatted_chat_history.append({
                        "role": role,
                        "content": message["text"]
                    })
                elif "content" in message and "role" in message:
                    if message["role"] == "assistant":
                        formatted_chat_history.append({
                            "role": "system",
                            "content": message["content"]
                        })
                    else:
                        formatted_chat_history.append(message)
                else:
                    logger.warning(f"Unexpected message format: {message}")
                    continue
                    
            response = client.chat.completions.create(
                model="meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
                messages = [
                    {
                        "role": "system",
                        "content": (
                            "You are a helpful, respectful and honest medical assistant. You are a clinical decision support system designed to aid in doctor decisions. "
                            "Always answer as helpfully as possible, while being safe. "
                            "Your answers should not include any harmful, unethical, racist, sexist, toxic, dangerous, or illegal content. "
                            "Please ensure that your responses are socially unbiased and positive in nature. If a question does not make any sense, or is not factually coherent, explain why instead of answering something not correct. "
                            "If you don’t know the answer to a question, please don’t share false information."
                        ),
                    },
                    *formatted_chat_history,
                ]
            )
            return response.choices[0].message.content
       
        except requests.exceptions.HTTPError as http_err:
            if hasattr(http_err, 'response') and http_err.response.status_code == 429:
                return "The service is currently experiencing high demand. Please try again later."
            return "I'm having trouble connecting to the AI service. Please try again later."
        except Exception as e:
            return "I'm sorry, I'm having trouble processing your request at the moment. Please try again later."

class CloudinaryService:
    @staticmethod
    def upload_base64_image(base64_data):
        try:
            public_id = f"skin_lesions/{uuid.uuid4()}"
            
            result = cloudinary.uploader.upload(
                base64_data,
                public_id=public_id,
                folder="skin_lesions",
                overwrite=True
            )
            
            return {
                "success": True,
                "url": result['secure_url'],
                "public_id": result['public_id']
            }
        except Exception as e:
            print(f"Error uploading to Cloudinary: {e}")
            return {
                "success": False,
                "error": str(e)
            }

MODEL_PATH = Path(__file__).parent / "model" / "pretrained_mobilenetv2.h5"

try:
    from tensorflow.keras.models import load_model
    from tensorflow.keras.applications.mobilenet_v2 import preprocess_input as mobilenet_preprocess
    model = load_model(MODEL_PATH)
    model_preprocessor = mobilenet_preprocess
except Exception as e:
    logger.error(f"Failed to load model from {MODEL_PATH}: {e}")
    model = None
    model_preprocessor = None

def classify_base64_image(b64: str) -> dict:
    if not model or not model_preprocessor:
        return {"classes": []}
    try:
        data = base64.b64decode(b64.split(",",1)[-1])
        img = Image.open(io.BytesIO(data)).convert("RGB").resize((224, 224))
        arr = np.array(img)
        # Use MobileNetV2 preprocessing (normalizes to [-1, 1])
        arr = model_preprocessor(arr)
        preds = model.predict(arr[np.newaxis, ...], verbose=0)[0]
        return {"classes": preds.tolist()}
    except Exception as e:
        logger.error(f"Classification error: {e}")
        return {"classes": []}
