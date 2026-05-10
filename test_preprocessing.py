import sys
sys.path.insert(0, 'BackEnd')
import base64, io, numpy as np
from PIL import Image
from tensorflow.keras.models import load_model

model = load_model('BackEnd/model/full_skin_cancer_model.h5')
test_img = 'ISIC_0029449_NV.jpg'  # NV should NOT predict BCC
classes = ['AKIEC', 'BCC', 'BKL', 'DF', 'MEL', 'NV', 'VASC']

b = open(test_img, 'rb').read()
b64 = 'data:image/jpeg;base64,' + base64.b64encode(b).decode()
data = base64.b64decode(b64.split(",", 1)[-1])
img_pil = Image.open(io.BytesIO(data))

print("Original PIL image size:", img_pil.size)
print("\nTrying different preprocessing methods:\n")

# Method 1: Current (100, 75) resize
img1 = img_pil.convert("RGB").resize((100, 75))
arr1 = np.array(img1).astype('float32') / 255.0
pred1 = model.predict(arr1[np.newaxis, ...])[0]
print(f"Method 1 - resize(100,75), norm/255: {classes[np.argmax(pred1)]} | probs: {[f'{p:.3f}' for p in pred1]}")

# Method 2: Swap dimensions - resize(75, 100)
img2 = img_pil.convert("RGB").resize((75, 100))
arr2 = np.array(img2).astype('float32') / 255.0
pred2 = model.predict(arr2[np.newaxis, ...])[0]
print(f"Method 2 - resize(75,100), norm/255: {classes[np.argmax(pred2)]} | probs: {[f'{p:.3f}' for p in pred2]}")

# Method 3: No normalization
img3 = img_pil.convert("RGB").resize((100, 75))
arr3 = np.array(img3).astype('float32')
pred3 = model.predict(arr3[np.newaxis, ...])[0]
print(f"Method 3 - resize(100,75), NO norm: {classes[np.argmax(pred3)]} | probs: {[f'{p:.3f}' for p in pred3]}")

# Method 4: Try grayscale
img4 = img_pil.convert("L").resize((100, 75))
arr4 = np.array(img4).astype('float32')
arr4 = np.stack([arr4, arr4, arr4], axis=-1) / 255.0  # Repeat to 3 channels
try:
    pred4 = model.predict(arr4[np.newaxis, ...])[0]
    print(f"Method 4 - grayscale->RGB, resize(100,75): {classes[np.argmax(pred4)]} | probs: {[f'{p:.3f}' for p in pred4]}")
except:
    print("Method 4 - grayscale->RGB: FAILED")

# Method 5: BGR instead of RGB
img5 = img_pil.convert("RGB").resize((100, 75))
arr5 = np.array(img5)[:, :, ::-1].astype('float32') / 255.0  # BGR
pred5 = model.predict(arr5[np.newaxis, ...])[0]
print(f"Method 5 - resize(100,75), BGR norm/255: {classes[np.argmax(pred5)]} | probs: {[f'{p:.3f}' for p in pred5]}")
