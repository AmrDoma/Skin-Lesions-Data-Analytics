import sys
sys.path.insert(0, 'BackEnd')
import services, base64
from pathlib import Path

test_images = [
    ('ISIC_0029578_df.jpg', 'DF'),
    ('ISIC_0029571_MEL.jpg', 'MEL'),
    ('ISIC_0029449_NV.jpg', 'NV'),
    ('ISIC_0029466_BCC.jpg', 'BCC'),
]
classes = ['AKIEC', 'BCC', 'BKL', 'DF', 'MEL', 'NV', 'VASC']

for img_path, true_class in test_images:
    if Path(img_path).exists():
        b = open(img_path, 'rb').read()
        b64 = 'data:image/jpeg;base64,' + base64.b64encode(b).decode()
        result = services.classify_base64_image(b64)
        probs = result.get('classes', [])
        if probs:
            predicted = classes[max(range(len(probs)), key=lambda i: probs[i])]
            prob_str = ', '.join(f"{p:.3f}" for p in probs)
            print(f'{true_class:6} -> predicted {predicted:6} | {prob_str}')
