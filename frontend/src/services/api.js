import axios from "axios";

export const api = axios.create({
  baseURL: "https://multimodal-recommender-system-4.onrender.com",
  timeout: 60000, // 60 seconds for Render cold start
});

export const getRecommendations = async (userId) => {
  const payload = {
    user_id: Number(userId),
    top_k: 5,
  };

  try {
    const res = await api.post("/recommend", payload);
    return res.data;
  } catch (err) {
    // Retry once after cold start delay
    await new Promise((resolve) => setTimeout(resolve, 30000));
    const res = await api.post("/recommend", payload);
    return res.data;
  }
};
