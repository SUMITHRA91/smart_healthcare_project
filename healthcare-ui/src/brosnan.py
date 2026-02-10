import pandas as pd
import numpy as np
import warnings
warnings.filterwarnings("ignore")

import matplotlib.pyplot as plt
import seaborn as sns
from imblearn.over_sampling import SMOTE
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier

import pickle

# ===================== LOAD DATA =====================
file_path = "AI_Brosnan_CancerDataset.xlsx"
df = pd.read_excel("AI_Brosnan_CancerDataset.xlsx", sheet_name="Cleaned_Data")
print("Dataset Loaded:", df.shape)

# ===================== FEATURE ENGINEERING =====================
df_model = df.drop(columns=["Name"]).copy()

risk_threshold = df_model["Risk_Score"].median()
df_model["High_Risk"] = (df_model["Risk_Score"] > risk_threshold).astype(int)


ordinal_categories = [ 
    "Alcohol_Consumption",  
    "Insurance_Type"  
]

# Define categories without ranking (nominal) - use One-Hot Encoding
nominal_categories = [
    "Gender", 
    "Smoking",  
    "Diabetes",  
    "Hypertension",  
    "Heart_Disease",  
]

# Check which columns actually exist in our dataframe
available_ordinal = [col for col in ordinal_categories if col in df_model.columns]
available_nominal = [col for col in nominal_categories if col in df_model.columns]

print(f"\nEncoding Strategy:")
print(f"Ordinal categories (Label Encoding): {available_ordinal}")
print(f"Nominal categories (One-Hot Encoding): {available_nominal}")

# 1. LABEL ENCODING for ordinal categories
label_encoders = {}
for col in available_ordinal:
    le = LabelEncoder()
    df_model[col + "_encoded"] = le.fit_transform(df_model[col])
    label_encoders[col] = le
    print(f"  {col} encoded as: {dict(zip(le.classes_, le.transform(le.classes_)))}")

# 2. ONE-HOT ENCODING for nominal categories
if available_nominal:
    df_ohe = pd.get_dummies(df_model[available_nominal], 
                           prefix=available_nominal,
                           drop_first=True)
    print(f"\nCreated {df_ohe.shape[1]} one-hot encoded features")
else:
    df_ohe = pd.DataFrame()  # Empty dataframe if no nominal columns

# ===================== NUMERICAL FEATURES =====================
numerical_features = [
    "Age", "Height_cm", "Weight_kg", "BMI", "Systolic_BP", "Diastolic_BP",
    "Heart_Rate", "Temperature_F", "Blood_Sugar", "Cholesterol",
    "Hemoglobin", "Exercise_Hours_Week", "Hospital_Visits_Year"
]

# ===================== ADDITIONAL FEATURE ENGINEERING =====================
df_model["BMI_Age_Interaction"] = df_model["BMI"] * df_model["Age"]
df_model["BP_Ratio"] = df_model["Systolic_BP"] / df_model["Diastolic_BP"].replace(0, np.nan)
df_model["BP_Ratio"].fillna(df_model["BP_Ratio"].median(), inplace=True)

df_model["High_Cholesterol"] = (df_model["Cholesterol"] > df_model["Cholesterol"].median()).astype(int)
df_model["High_Blood_Sugar"] = (df_model["Blood_Sugar"] > df_model["Blood_Sugar"].median()).astype(int)
df_model["Low_Exercise"] = (df_model["Exercise_Hours_Week"] < df_model["Exercise_Hours_Week"].median()).astype(int)

df_model["Health_Score"] = (
    (df_model["Exercise_Hours_Week"] / df_model["Exercise_Hours_Week"].max()) * 0.3 +
    (1 - df_model["BMI"] / df_model["BMI"].max()) * 0.3 +
    (1 - df_model["Cholesterol"] / df_model["Cholesterol"].max()) * 0.2 +
    (1 - df_model["Blood_Sugar"] / df_model["Blood_Sugar"].max()) * 0.2
)

engineered_features = [
    "BMI_Age_Interaction", "BP_Ratio", "Health_Score",
    "High_Cholesterol", "High_Blood_Sugar", "Low_Exercise"
]

numerical_features.extend(engineered_features)

# ===================== CREATE FINAL FEATURE MATRIX =====================
# Collect all feature components
feature_components = []

# 1. Numerical features
feature_components.append(df_model[numerical_features])

# 2. Label encoded ordinal features
if available_ordinal:
    label_encoded_features = [col + "_encoded" for col in available_ordinal]
    feature_components.append(df_model[label_encoded_features])

# 3. One-hot encoded nominal features
if not df_ohe.empty:
    feature_components.append(df_ohe)

# Combine all features
if len(feature_components) > 1:
    X = pd.concat(feature_components, axis=1)
else:
    X = feature_components[0]

y = df_model["High_Risk"]

print(f"\nFeature Engineering Completed")
print(f"Total Features Used: {X.shape[1]}")
print(f"Target distribution: {dict(y.value_counts())}")
print(f"\nFeature breakdown:")
print(f"- Numerical features: {len(numerical_features)}")
print(f"- Label encoded features: {len(available_ordinal)}")
print(f"- One-hot encoded features: {df_ohe.shape[1] if not df_ohe.empty else 0}")
print(f"\nFirst few features: {list(X.columns[:10])}")

# ===================== TRAIN TEST SPLIT =====================
print("\n==================== TRAIN–TEST SPLIT ====================")

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42
)

print("Train shape:", X_train.shape)
print("Test shape :", X_test.shape)
print("\nClass distribution BEFORE SMOTE:")
print(y_train.value_counts())


# ===================== SMOTE FOR BALANCING =====================
print("\n==================== APPLYING SMOTE ====================")

smote = SMOTE(random_state=42)
X_train, y_train = smote.fit_resample(X_train, y_train)

print("Class distribution AFTER SMOTE:")
print(y_train.value_counts())


# ===================== FEATURE SCALING =====================
print("\n==================== FEATURE SCALING ====================")

#  Choose ONE scaler
scaler = StandardScaler()
# scaler = MinMaxScaler()

X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

pickle.dump(scaler, open("scaler.pkl", "wb"))

# ===================== MULTI-MODEL TRAINING (RECALL BASED) =====================
def train_multiple_models(X_train, y_train):
    models = {
        'RandomForest': RandomForestClassifier(n_estimators=100, random_state=42),
        'DecisionTree': DecisionTreeClassifier(random_state=42),
        'LogisticRegression': LogisticRegression(random_state=42, max_iter=1000),
        'SVM': SVC(random_state=42, probability=True),
        'KNN': KNeighborsClassifier(n_neighbors=5)
    }

    trained_models = {}
    model_scores = {}

    for name, model in models.items():
        print(f"\nTraining {name}...")

        model.fit(X_train, y_train)
        trained_models[name] = model
 
        cv_scores = cross_val_score(model, X_train, y_train, cv=5, scoring='recall')

        model_scores[name] = {
            'cv_mean': cv_scores.mean(),
            'cv_std': cv_scores.std(),
            'cv_scores': cv_scores.tolist()
        }

        print(f"{name} Recall Score: {cv_scores.mean():.4f} (+/- {cv_scores.std() * 2:.4f})")

    return trained_models, model_scores


def select_best_model(model_scores):
    best_model_name = max(model_scores, key=lambda x: model_scores[x]['cv_mean'])
    best_score = model_scores[best_model_name]['cv_mean']
    return best_model_name, best_score


def save_models(trained_models, model_scores, best_model_name):
    with open('trained_models.pkl', 'wb') as f:
        pickle.dump(trained_models, f)

    with open('model_scores.pkl', 'wb') as f:
        pickle.dump(model_scores, f)

    with open('best_model.pkl', 'wb') as f:
        pickle.dump(trained_models[best_model_name], f)

    model_info = {
        'best_model_name': best_model_name,
        'best_model_score': model_scores[best_model_name]['cv_mean'],
        'all_model_scores': {name: scores['cv_mean'] for name, scores in model_scores.items()}
    }

    with open('model_info.pkl', 'wb') as f:
        pickle.dump(model_info, f)

    return model_info


# ===================== RUN TRAINING =====================
print("\n===================== TRAINING MODELS =====================")

trained_models, model_scores = train_multiple_models(X_train_scaled, y_train)

best_model_name, best_score = select_best_model(model_scores)

model_info = save_models(trained_models, model_scores, best_model_name)

print("\n===================== MODEL SELECTION RESULTS =====================")
print(f"Best model (based on Recall): {best_model_name}")
print(f"Best CV Recall score: {best_score:.4f}")

print("\nAll model recall scores:")
for name, score in model_info['all_model_scores'].items():
    print(f"  {name}: {score:.4f}")



import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    roc_curve,
    confusion_matrix,
    classification_report
)

import pickle
import warnings
warnings.filterwarnings("ignore")


# ===================== MODEL EVALUATION =====================
def evaluate_all_models(trained_models, X_test, y_test):
    results = {}

    for name, model in trained_models.items():
        y_pred = model.predict(X_test)

        y_proba = (
            model.predict_proba(X_test)[:, 1]
            if hasattr(model, "predict_proba")
            else None
        )

        results[name] = {
            "accuracy": accuracy_score(y_test, y_pred),
            "precision": precision_score(y_test, y_pred, zero_division=0),
            "recall": recall_score(y_test, y_pred, zero_division=0),
            "f1": f1_score(y_test, y_pred, zero_division=0),
            "auc": roc_auc_score(y_test, y_proba) if y_proba is not None else None,
            "y_pred": y_pred,
            "y_proba": y_proba,
            "confusion_matrix": confusion_matrix(y_test, y_pred),
            "classification_report": classification_report(
                y_test, y_pred, output_dict=True, zero_division=0
            )
        }

    return results


# ===================== MAIN DASHBOARD =====================
def create_main_dashboard(results, y_test):
    model_names = list(results.keys())

    accuracies = [results[m]["accuracy"] for m in model_names]
    precisions = [results[m]["precision"] for m in model_names]
    recalls = [results[m]["recall"] for m in model_names]
    f1s = [results[m]["f1"] for m in model_names]
    aucs = [results[m]["auc"] for m in model_names]

    safe_aucs = [a if a is not None else 0 for a in aucs]

    x = np.arange(len(model_names))
    width = 0.2

    plt.figure(figsize=(18, 10))

    # --------- 1. PERFORMANCE COMPARISON ---------
    plt.subplot(2, 2, 1)
    plt.bar(x - 1.5 * width, accuracies, width, label="Accuracy")
    plt.bar(x - 0.5 * width, precisions, width, label="Precision")
    plt.bar(x + 0.5 * width, recalls, width, label="Recall")
    plt.bar(x + 1.5 * width, f1s, width, label="F1-score")

    plt.xticks(x, model_names, rotation=45)
    plt.ylabel("Score")
    plt.title("Model Performance Comparison")
    plt.legend()
    plt.grid(alpha=0.3)

    # --------- 2. ROC CURVES ---------
    plt.subplot(2, 2, 2)
    for model in model_names:
        if results[model]["y_proba"] is not None:
            fpr, tpr, _ = roc_curve(y_test, results[model]["y_proba"])
            plt.plot(fpr, tpr, label=f"{model} (AUC={results[model]['auc']:.3f})")

    plt.plot([0, 1], [0, 1], "k--")
    plt.xlabel("False Positive Rate")
    plt.ylabel("True Positive Rate")
    plt.title("ROC Curves")
    plt.legend()
    plt.grid(alpha=0.3)

    # --------- 3. ACCURACY BAR ---------
    plt.subplot(2, 2, 3)
    bars = plt.bar(model_names, accuracies)
    plt.title("Model Accuracy Comparison")
    plt.xticks(rotation=45)

    for bar, acc in zip(bars, accuracies):
        plt.text(
            bar.get_x() + bar.get_width() / 2,
            bar.get_height(),
            f"{acc:.3f}",
            ha="center",
            va="bottom"
        )

    # --------- 4. AUC BAR ---------
    plt.subplot(2, 2, 4)
    bars = plt.bar(model_names, safe_aucs)
    plt.title("Model AUC Comparison")
    plt.xticks(rotation=45)

    for bar, auc in zip(bars, aucs):
        label = f"{auc:.3f}" if auc is not None else "N/A"
        plt.text(
            bar.get_x() + bar.get_width() / 2,
            bar.get_height(),
            label,
            ha="center",
            va="bottom"
        )

    plt.tight_layout()
    plt.savefig("model_evaluation_dashboard.png", dpi=300)
    plt.show()


# ===================== CONFUSION MATRICES =====================
def plot_all_confusion_matrices(results):
    for model_name, data in results.items():
        plt.figure(figsize=(4, 4))
        sns.heatmap(
            data["confusion_matrix"],
            annot=True,
            fmt="d",
            cmap="Blues",
            cbar=False
        )
        plt.title(f"Confusion Matrix - {model_name}")
        plt.xlabel("Predicted")
        plt.ylabel("Actual")
        plt.tight_layout()
        plt.show()


# ===================== SAVE RESULTS =====================
def save_evaluation_results(results):
    summary = []

    for model, m in results.items():
        summary.append({
            "Model": model,
            "Accuracy": m["accuracy"],
            "Precision": m["precision"],
            "Recall": m["recall"],
            "F1": m["f1"],
            "AUC": m["auc"]
        })

    df = pd.DataFrame(summary)
    df.to_csv("model_evaluation_summary.csv", index=False)

    with open("evaluation_results.pkl", "wb") as f:
        pickle.dump(results, f)

    return df


# ===================== MAIN EXECUTION =====================
if __name__ == "__main__":

    with open("trained_models.pkl", "rb") as f:
        trained_models = pickle.load(f)

    X_test = pd.read_csv("X_test.csv")
    y_test = pd.read_csv("y_test.csv").squeeze()

    results = evaluate_all_models(trained_models, X_test, y_test)

    create_main_dashboard(results, y_test)

    plot_all_confusion_matrices(results)

    summary_df = save_evaluation_results(results)

    print("\nModel Evaluation Summary:")
    print(summary_df)