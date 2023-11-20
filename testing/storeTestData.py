import firebase_admin
from firebase_admin import credentials, firestore
import pandas as pd

# Initialize Firebase Admin SDK
cred = credentials.Certificate(
    r"C:\Users\HUAWEI\OneDrive\เดสก์ท็อป\IoT-Dashboard\testing\test2-iotdashboard-firebase-adminsdk-m964p-0347f016bd.json")

firebase_admin.initialize_app(cred)

# Load your time-series dataset
dataset = pd.read_csv(
    r"C:\Users\HUAWEI\OneDrive\เดสก์ท็อป\IoT-Dashboard\prepareData\dataset_clean.csv")

# Select the time series dataset between 19:00:00 to 23:59:59 of 1/6/2016 to conduct the experiment
data = dataset.iloc[414000:432000]

# Store data in the primary collection
db = firestore.client()
primary_collection = db.collection("primary")

for _, row in data.iterrows():
    # Combine date and time to create a unique document ID without nested slashes
    time_str = f"{row['date']}_{row['time']}".replace("/", "-")

    # Use the time_str as the document ID
    primary_collection.document(time_str).set(row.to_dict())

print("Data storage completed.")
