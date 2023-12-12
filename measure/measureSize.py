from firebase_admin import credentials, firestore, initialize_app

# Initialize Firebase and Firestore client
cred = credentials.Certificate(r"C:\Users\Stark\Desktop\IoT-Dashboard\prepareData\iot-dashboard-66709-firebase-adminsdk-gwzj0-45780976ab.json")
initialize_app(cred)
db = firestore.client()

collection = db.collection("archive")
doc = collection.document('2016-06-01_12').get()
data = doc.to_dict()


binary_data = data['data']

file_path = r"C:\Users\Stark\Desktop\Gzipfile\gzip10.gz"  

# Write binary data to a local file
with open(file_path, 'wb') as file:
    file.write(binary_data) 
