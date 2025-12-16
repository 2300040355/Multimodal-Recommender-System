import axios from "axios";

export const api = axios.create({
  baseURL: "https://multimodal-recommender-system-4.onrender.com",
});

export const getRecommendations = (userId) =>
  api.post("/recommend", {
    user_id: Number(userId),
    top_k: 5,
  });
