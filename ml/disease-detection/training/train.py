import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, models, transforms
from torch.utils.data import DataLoader
import os
import json

data_dir = r"D:\AgriSaarthi\ml\disease-detection\data\PlantVillage\PlantVillage"

if not os.path.exists(data_dir):
    print("Dataset not found!")
    exit(1)

data_transforms = {
    'train': transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.RandomHorizontalFlip(),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ]),
    'val': transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ]),
}

full_dataset = datasets.ImageFolder(data_dir, transform=data_transforms['train'])
class_names = full_dataset.classes

print(f"Detected {len(class_names)} classes.")
print(f"Total images: {len(full_dataset)}")

# For demonstration and reasonable execution time, we train on a small subset
# In a real environment, you would train on the full dataset with 10-20 epochs.
subset_size = 500 
indices = torch.randperm(len(full_dataset))[:subset_size]
subset = torch.utils.data.Subset(full_dataset, indices)

train_size = int(0.8 * len(subset))
val_size = len(subset) - train_size
train_dataset, val_dataset = torch.utils.data.random_split(subset, [train_size, val_size])

val_dataset.dataset.transform = data_transforms['val']

dataloaders = {
    'train': DataLoader(train_dataset, batch_size=32, shuffle=True, num_workers=0),
    'val': DataLoader(val_dataset, batch_size=32, shuffle=False, num_workers=0)
}

device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")

model = models.mobilenet_v2(pretrained=True)
num_ftrs = model.classifier[1].in_features
model.classifier[1] = nn.Linear(num_ftrs, len(class_names))

model = model.to(device)
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=0.001)

num_epochs = 2
for epoch in range(num_epochs):
    print(f'Epoch {epoch}/{num_epochs - 1}')
    print('-' * 10)
    for phase in ['train', 'val']:
        if phase == 'train':
            model.train()
        else:
            model.eval()

        running_loss = 0.0
        running_corrects = 0

        for inputs, labels in dataloaders[phase]:
            inputs = inputs.to(device)
            labels = labels.to(device)

            optimizer.zero_grad()

            with torch.set_grad_enabled(phase == 'train'):
                outputs = model(inputs)
                _, preds = torch.max(outputs, 1)
                loss = criterion(outputs, labels)

                if phase == 'train':
                    loss.backward()
                    optimizer.step()

            running_loss += loss.item() * inputs.size(0)
            running_corrects += torch.sum(preds == labels.data)

        epoch_loss = running_loss / len(dataloaders[phase].dataset)
        epoch_acc = running_corrects.double() / len(dataloaders[phase].dataset)

        print(f'{phase} Loss: {epoch_loss:.4f} Acc: {epoch_acc:.4f}')

os.makedirs(r"D:\AgriSaarthi\ml\disease-detection\model", exist_ok=True)
torch.save(model.state_dict(), r"D:\AgriSaarthi\ml\disease-detection\model\disease_model.pth")
with open(r"D:\AgriSaarthi\ml\disease-detection\model\classes.json", "w") as f:
    json.dump(class_names, f)

print("Training complete. Model saved.")
