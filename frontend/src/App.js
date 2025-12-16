import { useState } from "react";
import { motion } from "framer-motion";
import { getRecommendations } from "./services/api";

export default function App() {
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [recs, setRecs] = useState([]);
  const [status, setStatus] = useState("");

  const fetchRecs = async () => {
    setLoading(true);
    setStatus("Waking up recommendation engine...");
    try {
      const data = await getRecommendations(userId);
      setRecs(data.recommendations);
      setStatus("");
    } catch {
      setStatus("Service is waking up, please wait...");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-10">
      <h1 className="text-4xl font-bold mb-6">
        Multimodal Recommendation Engine
      </h1>

      <div className="flex gap-4 mb-8">
        <input
          className="p-3 rounded bg-gray-800 border border-gray-700"
          placeholder="Enter User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
        <button
          onClick={fetchRecs}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded"
        >
          Recommend
        </button>
      </div>

      {status && <p className="text-yellow-400 mb-4">{status}</p>}

      {loading && (
        <div className="grid grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-800 animate-pulse rounded" />
          ))}
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {recs.map((item, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.05 }}
            className="p-6 bg-gray-800 rounded-xl shadow-lg"
          >
            <h3 className="text-xl font-semibold">{item.title}</h3>
            <p className="text-gray-400 mt-2">{item.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
