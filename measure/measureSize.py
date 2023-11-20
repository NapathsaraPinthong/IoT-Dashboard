from firebase_admin import credentials, firestore, initialize_app

# Initialize Firebase and Firestore client
cred = credentials.Certificate(r"C:\Users\Stark\Desktop\IoT-Dashboard\prepareData\iot-dashboard-66709-firebase-adminsdk-gwzj0-45780976ab.json")
initialize_app(cred)
db = firestore.client()

collection = db.collection("archive")
doc = collection.document('2016-06-01_12').get()
data = doc.to_dict()

# Assuming 'data' is already in binary format (e.g., gzip data)
binary_data = data['data']  # Replace 'binary_field' with the actual field containing binary data

file_path = r"C:\Users\Stark\Desktop\Gzipfile\gzip10.gz"  # Replace with your desired file path

# Write binary data to a local file
with open(file_path, 'wb') as file:
    file.write(binary_data)  # Write the binary data to the file
