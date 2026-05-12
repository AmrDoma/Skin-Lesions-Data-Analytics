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
import cloudinary
import cloudinary.uploader
import cv2


load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME', 'your_cloud_name'),
    api_key=os.getenv('CLOUDINARY_API_KEY', 'your_api_key'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET', 'your_api_secret'),
    secure=True
)
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

MODEL_PATH = Path(__file__).parent / "model" / "skin_lesion_model.onnx"

try:
    model = cv2.dnn.readNetFromONNX(str(MODEL_PATH))
    logger.info("Successfully loaded ONNX model using OpenCV")
except Exception as e:
    logger.error(f"Failed to load model from {MODEL_PATH}: {e}")
    model = None

def classify_base64_image(b64: str) -> dict:
    if not model:
        return {"classes": []}
    try:
        data = base64.b64decode(b64.split(",",1)[-1])
        # Resize to match the actual model input (width=100, height=75)
        img = Image.open(io.BytesIO(data)).convert('RGB').resize((100, 75))
        
        # Preprocess exactly as the original model expected
        arr = np.array(img, dtype=np.float32) / 255.0
        
        # Add batch dimension: (1, 75, 100, 3)
        input_tensor = arr[np.newaxis, ...]
        
        # Run inference using OpenCV
        model.setInput(input_tensor)
        preds = model.forward()
        
        return {"classes": preds[0].tolist()}
    except Exception as e:
        logger.error(f"Classification error: {e}")
        return {"classes": []}
