import firebase_admin
from firebase_admin import credentials, firestore
import gzip
import io

# Initialize Firebase Admin SDK
cred = credentials.Certificate(r"C:\Users\Stark\Desktop\IoT-Dashboard\prepareData\iot-dashboard-66709-firebase-adminsdk-gwzj0-45780976ab.json")
firebase_admin.initialize_app(cred)

# Initialize Firestore
db = firestore.client()

# Reference to the last group in the archive collection
last_group_ref = db.collection("archive").document("2016-06-01_1")

# Retrieve the Gzip-compressed data from Firestore
data_dict = last_group_ref.get().to_dict()

if data_dict:
    gzip_data = data_dict.get("data")

    if gzip_data:
        # Decompress the Gzip data
        with io.BytesIO(gzip_data) as buf:
            with gzip.GzipFile(fileobj=buf, mode='rb') as f:
                decompressed_data = f.read()

        # Now, you can work with the decompressed data
        print(decompressed_data.decode('utf-8'))  # Adjust the decoding based on your data type
    else:
        print("No Gzip data found in the last group.")
else:
    print("Last group document not found in the archive collection.")

# Don't forget to close the Firebase Admin app when done
firebase_admin.delete_app(firebase_admin.get_app())
