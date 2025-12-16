from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
import pandas as pd
import joblib
import pickle

app = FastAPI(title="Multimodal Recommender System API")

# -------------------- CORS --------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------- LOAD ARTIFACTS --------------------
BASE = "models"

item_embeddings = np.load(f"{BASE}/item_embeddings.npy")
catalog = pd.read_pickle(f"{BASE}/catalog.pkl")
retriever = joblib.load(f"{BASE}/retriever.pkl")
ranker = joblib.load(f"{BASE}/ranker.pkl")

with open(f"{BASE}/item_emb_dict.pkl", "rb") as f:
    item_emb_dict = pickle.load(f)

with open(f"{BASE}/behavior.pkl", "rb") as f:
    behavior = pickle.load(f)

EMB_DIM = item_embeddings.shape[1]

# -------------------- REQUEST SCHEMA --------------------
class RecommendRequest(BaseModel):
    user_id: int
    top_k: int = 5

# -------------------- HEALTH --------------------
@app.get("/")
def root():
    return {"status": "API running"}

# -------------------- RECOMMEND --------------------
@app.post("/recommend")
def recommend(req: RecommendRequest):
    user_id = req.user_id
    top_k = req.top_k

    # 1️⃣ Get user interaction history
    user_items = (
        behavior[behavior.user_id == user_id]["item_id"]
        .tolist()
    )

    # 2️⃣ Cold-start fallback
    if len(user_items) == 0:
        popular = catalog.head(top_k)
        return {
            "user_id": user_id,
            "recommendations": popular[["item_id", "title", "description"]].to_dict("records")
        }

    # 3️⃣ Weighted user embedding (recent interactions matter more)
    vectors = []
    weights = []

    for idx, item_id in enumerate(user_items):
        if item_id in item_emb_dict:
            vectors.append(item_emb_dict[item_id])
            weights.append(1.0 + idx / len(user_items))  # recent ↑

    user_vec = np.average(vectors, axis=0, weights=weights)
    user_vec /= (np.linalg.norm(user_vec) + 1e-8)

    # 4️⃣ Retrieve candidates
    _, indices = retriever.kneighbors([user_vec], n_neighbors=50)

    candidate_ids = [
        list(item_emb_dict.keys())[i]
        for i in indices[0]
        if list(item_emb_dict.keys())[i] not in user_items  # 🔥 seen-item filtering
    ]

    # 5️⃣ Rank candidates
    ranked = []
    for item_id in candidate_ids:
        emb = item_emb_dict[item_id]
        sim = np.dot(emb, user_vec)
        feat = np.concatenate([emb, [sim]])
        score = ranker.predict([feat])[0]
        ranked.append((item_id, score))

    ranked.sort(key=lambda x: x[1], reverse=True)

    # 6️⃣ Diversity-aware selection (category-based)
    final_items = []
    used_categories = set()

    for item_id, _ in ranked:
        row = catalog[catalog.item_id == item_id].iloc[0]
        category = row.get("category", "unknown")

        if category not in used_categories:
            final_items.append({
                "item_id": item_id,
                "title": row["title"],
                "description": row["description"]
            })
            used_categories.add(category)

        if len(final_items) == top_k:
            break

    return {
        "user_id": user_id,
        "recommendations": final_items
    }
