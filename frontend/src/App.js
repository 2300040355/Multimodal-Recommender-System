import React, { useState } from "react";
import { getRecommendations } from "./services/api";

function App() {
  const [userId, setUserId] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRecommend = async () => {
    if (!userId) {
      setError("Please enter a user ID");
      return;
    }

    setLoading(true);
    setError("");
    setItems([]);

    try {
      const res = await getRecommendations(userId);
      setItems(res.data.recommendations);
    } catch (err) {
      setError("Failed to fetch recommendations");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>Multimodal Recommender System</h1>

      <input
        type="number"
        placeholder="Enter User ID"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
        style={{ padding: "8px", marginRight: "10px" }}
      />

      <button onClick={handleRecommend} style={{ padding: "8px 16px" }}>
        Recommend
      </button>

      {loading && <p>Loading recommendations...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <ul>
        {items.map((item, index) => (
          <li key={index} style={{ marginTop: "10px" }}>
            <strong>{item.title}</strong>
            <p>{item.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
