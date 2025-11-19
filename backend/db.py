import json
import os
from typing import Optional, List, Dict

DB_FILE = os.path.join(os.path.dirname(__file__), "..", "agents.json")

# Try to use Firestore (this will respect the FIRESTORE_EMULATOR_HOST env var
# when running the emulator). If google-cloud-firestore is not available or
# connection fails, we fall back to a simple file-based JSON store.
USE_FIRESTORE = False
firestore_client = None
try:
    from google.cloud import firestore
    firestore_client = firestore.Client()
    # Simple test read to ensure client can connect (may raise if misconfigured)
    _ = firestore_client.collections()
    USE_FIRESTORE = True
except Exception:
    USE_FIRESTORE = False


def _read_all() -> List[Dict]:
    try:
        with open(DB_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return []


def _write_all(data: List[Dict]):
    with open(DB_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def create_agent_doc(doc: Dict):
    if USE_FIRESTORE and firestore_client:
        agent_id = doc.get("id")
        # Use provided id as document id so we can look it up later.
        firestore_client.collection("agents").document(agent_id).set(doc)
        return
    # fallback to file
    data = _read_all()
    data.append(doc)
    _write_all(data)


def get_agent_by_id(agent_id: str) -> Optional[Dict]:
    if USE_FIRESTORE and firestore_client:
        doc = firestore_client.collection("agents").document(agent_id).get()
        if doc.exists:
            return doc.to_dict()
        return None
    data = _read_all()
    for d in data:
        if d.get("id") == agent_id:
            return d
    return None


def list_agents() -> List[Dict]:
    if USE_FIRESTORE and firestore_client:
        docs = firestore_client.collection("agents").stream()
        return [d.to_dict() for d in docs]
    return _read_all()
