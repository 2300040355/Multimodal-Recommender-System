
import axios from "axios";
export const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL
});
export const getRecommendations = (userId) =>
  api.post("/recommend", { user_id: Number(userId), top_k: 5 });
