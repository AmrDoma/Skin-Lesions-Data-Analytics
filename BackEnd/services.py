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
import onnxruntime as ort
import numpy as np


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
    session = ort.InferenceSession(str(MODEL_PATH))
    logger.info("Successfully loaded ONNX model using onnxruntime")
except Exception as e:
    logger.error(f"Failed to load model from {MODEL_PATH}: {e}")
    session = None

def softmax(x):
    e_x = np.exp(x - np.max(x)) # Subtract max for numerical stability
    return e_x / e_x.sum()

def classify_base64_image(b64: str) -> dict:
    if not session:
        return {"classes": []}
    try:
        # Decode and Resize
        data = base64.b64decode(b64.split(",", 1)[-1])
        img = Image.open(io.BytesIO(data)).convert('RGB').resize((224, 224))
        
        # Preprocess and Normalize
        # Ensure initial array is float32
        arr = np.array(img).astype(np.float32) / 255.0
        
        # Standardize (ImageNet means/stds)
        mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
        std = np.array([0.229, 0.224, 0.225], dtype=np.float32)
        arr = (arr - mean) / std
        
        # Transpose to NCHW: (1, 3, 224, 224)
        arr = np.transpose(arr, (2, 0, 1))
        
        # CRITICAL FIX: Explicitly cast the final tensor to float32
        input_tensor = arr[np.newaxis, :].astype(np.float32)
        
        # Run Inference
        input_name = session.get_inputs()[0].name
        preds = session.run(None, {input_name: input_tensor})
        raw_logits = preds[0][0]
        probabilities = softmax(raw_logits)
        return {"classes": probabilities.tolist()}
        
    except Exception as e:
        logger.error(f"Classification error: {e}")
        return {"classes": []}