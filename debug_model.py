from tensorflow.keras.models import load_model
import json

m = load_model('BackEnd/model/full_skin_cancer_model.h5')
print('Input shape:', m.input_shape)
print('Output shape:', m.output_shape)
print('\nModel layers (first 5):')
for i, layer in enumerate(m.layers[:5]):
    print(f'  {i}: {layer.name} - {layer}')
print('\nModel config:')
config = m.get_config()
print('  First layer:', config['layers'][0])
