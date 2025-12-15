
import { motion } from "framer-motion";
export default function RecommendationCard({ item }) {
  return (
    <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}
      style={{background:"#fff",padding:16,borderRadius:10,marginBottom:12}}>
      <h3>{item.title}</h3>
      <p>{item.description}</p>
    </motion.div>
  );
}
