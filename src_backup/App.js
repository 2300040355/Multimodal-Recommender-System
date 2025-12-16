
import { useState } from "react";
import { getRecommendations } from "./services/api";
import RecommendationCard from "./components/RecommendationCard";

export default function App() {
  const [userId, setUserId] = useState("");
  const [data, setData] = useState([]);

  const fetch = async () => {
    const res = await getRecommendations(userId);
    setData(res.data.recommendations);
  };

  return (
    <div style={{padding:40,maxWidth:600,margin:"auto"}}>
      <h1>Multimodal Recommender</h1>
      <input value={userId} onChange={e=>setUserId(e.target.value)} placeholder="User ID"/>
      <button onClick={fetch}>Recommend</button>
      {data.map(i => <RecommendationCard key={i.item_id} item={i} />)}
    </div>
  );
}
