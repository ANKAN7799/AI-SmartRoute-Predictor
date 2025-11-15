import { motion } from "framer-motion";

export default function ResultCard({ result }) {
  if (!result) return null;

  return (
    <motion.div
      className="max-w-2xl mx-auto mt-12 bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-8 rounded-3xl shadow-2xl border border-purple-200"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h3 className="text-3xl font-bold text-center text-indigo-700 mb-6">
        🚦 Predicted Route Details
      </h3>

      <div className="space-y-3 text-lg text-gray-800">
        <p>
          <strong className="text-indigo-600">Expected Delay:</strong>{" "}
          <span className="text-rose-600 font-bold text-2xl animate-pulse">
            {result.delay} min
          </span>
        </p>

        <p>
          <strong className="text-purple-600">Weather:</strong> {result.weather}
        </p>
        <p>
          <strong className="text-blue-600">Temperature:</strong>{" "}
          {result.temperature}°C
        </p>
        <p>
          <strong className="text-teal-600">Visibility:</strong>{" "}
          {result.visibility} km
        </p>
        <p>
          <strong className="text-pink-600">Best Route:</strong> {result.route}
        </p>
      </div>
    </motion.div>
  );
}
