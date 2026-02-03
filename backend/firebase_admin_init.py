# backend/firebase_admin_init.py
import os
import json
import firebase_admin
from firebase_admin import credentials, firestore

if not firebase_admin._apps:
    if "GOOGLE_APPLICATION_CREDENTIALS_JSON" not in os.environ:
        raise RuntimeError("Missing GOOGLE_APPLICATION_CREDENTIALS_JSON")

    cred_dict = json.loads(os.environ["GOOGLE_APPLICATION_CREDENTIALS_JSON"])
    cred = credentials.Certificate(cred_dict)
    firebase_admin.initialize_app(cred)

db = firestore.client()
