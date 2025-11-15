import { motion } from "framer-motion";

export default function Header() {
  return (
    <motion.header
      className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white py-6 px-4 text-center text-4xl font-extrabold tracking-widest shadow-lg rounded-b-3xl border-b border-purple-300/40"
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      🚗 Smart Route Predictor
      <p className="text-sm text-purple-100 mt-2 font-medium tracking-wide">
        Powered by OpenRouteService, WeatherAPI & ML Intelligence
      </p>
    </motion.header>
  );
}