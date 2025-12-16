import axios from "axios";

export const api = axios.create({
  baseURL: "https://multimodal-recommender-system-4.onrender.com",
  timeout: 60000, // 60 sec for cold start
});

export const getRecommendations = async (userId) => {
  try {
    const res = await api.post("/recommend", {
      user_id: Number(userId),
      top_k: 5,
    });
    return res.data;
  } catch (err) {
    // Retry once after cold start
    await new Promise((r) => setTimeout(r, 30000));
    const res = await api.post("/recommend", {
      user_id: Number(userId),
      top_k: 5,
    });
    return res.data;
  }
};
