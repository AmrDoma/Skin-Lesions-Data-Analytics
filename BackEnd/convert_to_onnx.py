import sys
import os
import tensorflow as tf
import tf2onnx

model_path = r'd:/1-College-shit/Huge Projects/Skin-Lesions-Data-Analytics/BackEnd/model/skin_lesion_model.h5'
output_path = r'd:/1-College-shit/Huge Projects/Skin-Lesions-Data-Analytics/BackEnd/model/skin_lesion_model.onnx'

try:
    from tensorflow.keras.layers import DepthwiseConv2D
    class CompatibleDepthwiseConv2D(DepthwiseConv2D):
        @classmethod
        def from_config(cls, config):
            config.pop("groups", None)
            return super().from_config(config)

    custom_objs = {
        'DepthwiseConv2D': CompatibleDepthwiseConv2D,
        'CompatibleDepthwiseConv2D': CompatibleDepthwiseConv2D,
    }

    print("Loading Keras model...")
    model = tf.keras.models.load_model(model_path, custom_objects=custom_objs, compile=False)
    
    print("Converting to ONNX...")
    spec = (tf.TensorSpec((None, 75, 100, 3), tf.float32, name="input"),)
    tf2onnx.convert.from_keras(model, input_signature=spec, output_path=output_path)
    print(f"Successfully converted to {output_path}")

except Exception as e:
    print(f"Error: {e}")
