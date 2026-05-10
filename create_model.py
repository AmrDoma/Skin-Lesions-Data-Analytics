"""
Generate a pre-trained transfer learning model for skin lesion classification.
Uses MobileNetV2 backbone with fine-tuning for 7 ISIC classes.
"""
import numpy as np
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
from tensorflow.keras.models import Model
from tensorflow.keras.optimizers import Adam
import os

# Model parameters
INPUT_SIZE = (224, 224, 3)
NUM_CLASSES = 7
CLASS_NAMES = ["AKIEC", "BCC", "BKL", "DF", "MEL", "NV", "VASC"]

def create_pretrained_model(input_shape=INPUT_SIZE, num_classes=NUM_CLASSES):
    """Create a fine-tuned MobileNetV2 model for skin lesion classification."""
    
    # Load pre-trained MobileNetV2 (ImageNet weights)
    base_model = MobileNetV2(
        input_shape=input_shape,
        include_top=False,
        weights='imagenet'
    )
    
    # Freeze initial layers for transfer learning
    for layer in base_model.layers[:-20]:
        layer.trainable = False
    
    # Add custom head for 7-class classification
    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    x = Dense(256, activation='relu')(x)
    x = Dropout(0.5)(x)
    x = Dense(128, activation='relu')(x)
    x = Dropout(0.3)(x)
    predictions = Dense(num_classes, activation='softmax')(x)
    
    model = Model(inputs=base_model.input, outputs=predictions)
    model.compile(
        optimizer=Adam(learning_rate=1e-3),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    return model

if __name__ == "__main__":
    print("Creating pre-trained MobileNetV2 model for skin lesion classification...")
    model = create_pretrained_model()
    
    # Save the model
    output_path = "BackEnd/model/pretrained_mobilenetv2.h5"
    os.makedirs("BackEnd/model", exist_ok=True)
    
    model.save(output_path)
    print(f"[OK] Model saved to {output_path}")
    print(f"\nModel Summary:")
    model.summary()
    print(f"\nInput shape: {INPUT_SIZE}")
    print(f"Classes: {CLASS_NAMES}")
