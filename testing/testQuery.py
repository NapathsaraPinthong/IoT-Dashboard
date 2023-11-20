from firebase_admin import credentials, firestore
from google.oauth2 import service_account
from google.cloud.firestore_v1.base_query import FieldFilter

# Specify the path to your service account key file
key_path = r"C:\Users\HUAWEI\OneDrive\เดสก์ท็อป\IoT-Dashboard\testing\test-iotdashboard-firebase-adminsdk-1oqvm-14127a112e.json"

# Initialize Firestore client with explicit credentials
credentials = service_account.Credentials.from_service_account_file(key_path)
db = firestore.Client(credentials=credentials)

# Specify your collection name
collection_name = "primary"

# Define the start and end time for the query
date = "1/6/2016"
start_time = "19:00:00"
end_time = "19:59:59"

# Create a reference to the collection
collection_ref = db.collection(collection_name)

# Perform the query
query = collection_ref.where(filter=FieldFilter("date", "==", date)).where(filter=FieldFilter("time", ">=", start_time)).where(filter=FieldFilter("time", "<", end_time))
result = query.stream()

# Process the query results
for doc in result:
    data = doc.to_dict()
    print(data)