import csv
import os
import joblib
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_path = os.path.join(base_dir, 'data', 'Crop_recommendation.csv')
    model_dir = os.path.join(base_dir, 'model')
    
    print(f"Loading dataset from: {data_path}")
    
    features = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
    X = []
    y = []
    
    with open(data_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            X.append([float(row[f]) for f in features])
            y.append(row['label'])
            
    X = np.array(X)
    y = np.array(y)
    
    print("\n--- Dataset Inspection ---")
    print(f"Rows: {len(y)}, Columns: {len(features)}")
    print(f"Unique Target Labels: {len(np.unique(y))}")
    print(f"Classes: {np.unique(y)}")
    
    print("\n--- Training Model ---")
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    print(f"Train shape: {X_train.shape}, Test shape: {X_test.shape}")
    
    clf = RandomForestClassifier(n_estimators=100, random_state=42)
    clf.fit(X_train, y_train)
    
    y_pred = clf.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    
    print(f"\nAccuracy: {acc:.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    
    # Save the model
    os.makedirs(model_dir, exist_ok=True)
    model_path = os.path.join(model_dir, 'crop_rf_model.joblib')
    joblib.dump(clf, model_path)
    
    print(f"Model saved to {model_path}")
    print("Features expected during inference:", features)

if __name__ == '__main__':
    main()
