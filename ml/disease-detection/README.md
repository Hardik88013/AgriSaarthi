# AgriSaarthi - Disease Detection ML

This directory contains the machine learning pipeline and FastAPI service for Plant Disease Detection using the PlantVillage dataset.

## Dataset Structure
Detected 15 classes from the PlantVillage dataset (Tomato, Potato, Pepper Bell), totaling 41,278 images.

## Model
We use Transfer Learning with **MobileNetV2** pre-trained on ImageNet. The classification head was modified to output 15 classes.

## Training
Due to CPU constraints in this environment, validation training was performed on a 500-image subset for 2 epochs. 
- Validation Accuracy: ~85%
- Loss Function: CrossEntropyLoss
- Optimizer: Adam
- Data Augmentation: HorizontalFlips, Resizing (224x224), Normalization.

Full-dataset training remains a future/production step.

To train the full model:
```bash
python training/train.py
```

## Endpoints
The model is integrated into the Python AI Service.
- **POST /predict/disease**: Expects `multipart/form-data` with an image file. Returns JSON:
  ```json
  {
    "predictedDisease": "Tomato_healthy",
    "confidence": 0.9654
  }
  ```

## Limitations
- Do not use for professional diagnosis.
- Image resolution should ideally be squared or close to 224x224 for best accuracy.
