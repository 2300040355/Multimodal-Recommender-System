from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np, pandas as pd, joblib, pickle, os

app = FastAPI(title="Multimodal Recommender System API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE = "models"

# Lazy-loaded globals
item_embeddings = None
catalog = None
retriever = None
ranker = None
item_emb_dict = None
behavior = None

def load_models():
    global item_embeddings, catalog, retriever, ranker, item_emb_dict, behavior
    if item_embeddings is None:
        item_embeddings = np.load(f"{BASE}/item_embeddings.npy")
        catalog = pd.read_pickle(f"{BASE}/catalog.pkl")
        retriever = joblib.load(f"{BASE}/retriever.pkl")
        ranker = joblib.load(f"{BASE}/ranker.pkl")
        with open(f"{BASE}/item_emb_dict.pkl", "rb") as f:
            item_emb_dict = pickle.load(f)
        with open(f"{BASE}/behavior.pkl", "rb") as f:
            behavior = pickle.load(f)

class RecommendRequest(BaseModel):
    user_id: int
    top_k: int = 5

@app.get("/")
def root():
    return {"status": "API running"}

@app.post("/recommend")
def recommend(req: RecommendRequest):
    load_models()  # 🔥 LOAD ONLY WHEN NEEDED

    user_items = behavior[behavior.user_id == req.user_id]["item_id"].tolist()
    vectors = [item_emb_dict.get(i, np.zeros(item_embeddings.shape[1])) for i in user_items]

    user_vec = np.mean(vectors, axis=0) if vectors else np.zeros(item_embeddings.shape[1])
    user_vec /= (np.linalg.norm(user_vec) + 1e-8)

    _, idx = retriever.kneighbors([user_vec])
    cands = item_embeddings[idx[0]]
    sims = np.dot(cands, user_vec)

    feats = np.concatenate([cands, sims.reshape(-1, 1)], axis=1)
    scores = ranker.predict(feats)

    order = np.argsort(scores)[::-1][:req.top_k]

    recs = []
    for i in order:
        row = catalog.iloc[idx[0][i]]
        recs.append({
            "item_id": int(row.item_id),
            "title": row.title,
            "description": row.description,
            "reason": "Similar to your past interactions",
            "similarity": float(sims[i])
        })

    return {"user_id": req.user_id, "recommendations": recs}
