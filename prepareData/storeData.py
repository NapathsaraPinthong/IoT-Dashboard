import firebase_admin
from firebase_admin import credentials, firestore
import pandas as pd
import io
import gzip
from datetime import datetime

# Initialize Firebase Admin SDK
cred = credentials.Certificate(
    r"C:\Users\HUAWEI\OneDrive\เดสก์ท็อป\IoT-Dashboard\prepareData\iot-dashboard-final-firebase-adminsdk-dpky6-f35a9531e2.json")

firebase_admin.initialize_app(cred)

# Load time-series dataset
dataset = pd.read_csv(
    r"C:\Users\HUAWEI\OneDrive\เดสก์ท็อป\IoT-Dashboard\prepareData\dataset.csv")

# Split the dataset into two parts
part1 = dataset.tail(3510)
part2 = dataset.iloc[:-3510]

# Store Part 1 in the temporary collection
db = firestore.client()
temporary_collection = db.collection("temporary")
for _, row in part1.iterrows():
    # Convert the time field to a string
    time_str = row["time"]

    # Use the time_str as the document ID
    temporary_collection.document(time_str).set(row.to_dict())


# Split Part 2 into 24 groups of hours in a day and store them as Gzip-compressed files in the archive collection
archive_collection = db.collection("archive")
grouped_part2 = [part2.iloc[i:i+3600] for i in range(0, len(part2), 3600)]

for i, group in enumerate(grouped_part2):
    date_str = group["date"].iloc[0] 

    date_field = datetime.strptime(date_str, "%d/%m/%Y")

    # Format the date as desired for use as the document ID
    formatted_date = date_field.strftime("%Y-%m-%d")

    # Create a unique identifier separate data according to hour
    unique_id = i % 24 
    
    # Create the document ID by combining the date and unique identifier without the time
    document_id = f"{formatted_date}_{unique_id}"

    group_csv = group.to_csv(index=False).encode()

    # Create a Gzip-compressed binary data using io.BytesIO
    compressed_data = io.BytesIO()
    with gzip.GzipFile(fileobj=compressed_data, mode='w') as f:
        f.write(group_csv)

    # Upload the Gzip-compressed data to Firestore with the modified document ID
    archive_collection.document(document_id).set(
        {"data": compressed_data.getvalue()})

print("Data separation and storage completed.")
