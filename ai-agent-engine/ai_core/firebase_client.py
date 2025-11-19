import firebase_admin
from firebase_admin import credentials, firestore
import os

# Load credentials dynamically if GOOGLE_APPLICATION_CREDENTIALS is set
if not firebase_admin._apps:
    cred_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")

    if cred_path and os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
    else:
        raise Exception("Google credentials JSON not found. Set GOOGLE_APPLICATION_CREDENTIALS env variable.")

    firebase_admin.initialize_app(cred)

db = firestore.client()