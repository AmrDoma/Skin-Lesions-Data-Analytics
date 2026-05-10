import sys
sys.path.insert(0, 'BackEnd')
import base64, io, numpy as np
from PIL import Image
from tensorflow.keras.models import load_model

model = load_model('BackEnd/model/full_skin_cancer_model.h5')
test_images = [
    ('ISIC_0029578_df.jpg', 'DF'),
    ('ISIC_0029571_MEL.jpg', 'MEL'),
    ('ISIC_0029449_NV.jpg', 'NV'),
    ('ISIC_0029466_BCC.jpg', 'BCC'),
]
classes = ['AKIEC', 'BCC', 'BKL', 'DF', 'MEL', 'NV', 'VASC']

print("Testing WITHOUT normalization (pixel values 0-255):\n")
for img_path, true_class in test_images:
    b = open(img_path, 'rb').read()
    b64 = 'data:image/jpeg;base64,' + base64.b64encode(b).decode()
    data = base64.b64decode(b64.split(",", 1)[-1])
    img = Image.open(io.BytesIO(data)).convert("RGB").resize((100, 75))
    arr = np.array(img).astype('float32')  # NO normalization
    pred = model.predict(arr[np.newaxis, ...], verbose=0)[0]
    predicted = classes[np.argmax(pred)]
    conf = np.max(pred)
    print(f'{true_class:6} -> predicted {predicted:6} ({conf*100:.1f}%) | probs: {[f"{p:.3f}" for p in pred]}')
