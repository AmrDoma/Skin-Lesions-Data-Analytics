import cv2
import numpy as np

model_path = r'd:/1-College-shit/Huge Projects/Skin-Lesions-Data-Analytics/BackEnd/model/model.onnx'
model = cv2.dnn.readNetFromONNX(model_path)

input_tensor = np.random.rand(1, 75, 100, 3).astype(np.float32)

try:
    model.setInput(input_tensor)
    preds = model.forward()
    print("Success! Shape:", preds.shape)
    print("Preds:", preds)
except Exception as e:
    print("NHWC failed:", e)
    try:
        input_tensor_nchw = np.random.rand(1, 3, 75, 100).astype(np.float32)
        model.setInput(input_tensor_nchw)
        preds = model.forward()
        print("NCHW Success! Shape:", preds.shape)
    except Exception as e2:
        print("NCHW failed too:", e2)
