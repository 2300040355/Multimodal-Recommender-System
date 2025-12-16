import { useState } from "react";
import { getRecommendations } from "./services/api";
import { FaUser, FaStar } from "react-icons/fa";

export default function App() {
  const [userId, setUserId] = useState("");
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleRecommend = async () => {
    setLoading(true);
    setMessage("Fetching recommendations…");
    setRecs([]);

    try {
      const data = await getRecommendations(userId);

      // ✅ BACKEND IS CONFIRMED WORKING
      setRecs(data.recommendations);
      setMessage("");
    } catch (err) {
      console.error(err);
      setMessage("Unexpected error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-10">
      {/* Header */}
      <h1 className="text-4xl font-bold mb-2">
        Multimodal Recommendation Engine
      </h1>
      <p className="text-gray-400 mb-8">
        AI-powered personalization using embeddings & ranking
      </p>

      {/* Input */}
      <div className="flex gap-4 items-center mb-10">
        <div className="flex items-center bg-gray-800 px-4 py-2 rounded-lg border border-gray-600">
          <FaUser className="text-gray-400 mr-2" />
          <input
            type="number"
            className="bg-transparent outline-none text-white"
            placeholder="User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
        </div>

        <button
          onClick={handleRecommend}
          className="bg-blue-600 px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Recommend
        </button>
      </div>

      {/* Status */}
      {loading && (
        <p className="text-yellow-400 mb-6 animate-pulse">
          Fetching recommendations…
        </p>
      )}

      {message && !loading && (
        <p className="text-yellow-400 mb-6">{message}</p>
      )}

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {recs.map((item, idx) => (
          <div
            key={idx}
            className="bg-gray-800 p-6 rounded-xl shadow-lg hover:scale-105 transition duration-300"
          >
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold">{item.title}</h2>
              <span className="flex items-center text-yellow-400 text-sm">
                <FaStar className="mr-1" /> AI Pick
              </span>
            </div>
            <p className="text-gray-400">{item.description}</p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <p className="text-gray-500 text-sm mt-14">
        Built with FastAPI • React • Tailwind • Deployed on Render
      </p>
    </div>
  );
}
