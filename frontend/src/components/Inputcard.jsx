// import { useState } from 'react';
// import { motion } from 'framer-motion';

// export default function InputCard({ onPredict }) {
//   const [source, setSource] = useState('');
//   const [destination, setDestination] = useState('');
//   const [time, setTime] = useState('');

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     onPredict({ source, destination, time });
//   };

//   return (
//     <motion.div
//       className="max-w-xl mx-auto bg-white p-6 rounded-2xl shadow-[0_0_20px_rgba(99,102,241,0.3)] mt-8 border border-indigo-300 transition-all duration-500"
//       initial={{ opacity: 0, y: 30 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.6 }}
//     >
//       <h2 className="text-3xl font-bold text-indigo-700 mb-6 text-center tracking-wide drop-shadow-md">
//         Enter Trip Details
//       </h2>
//       <form onSubmit={handleSubmit} className="flex flex-col gap-5">
//         <input
//           type="text"
//           placeholder="Enter Source"
//           value={source}
//           onChange={(e) => setSource(e.target.value)}
//           required
//           className="p-3 rounded-xl border border-indigo-300 bg-white shadow-inner transition duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent hover:shadow-[0_0_10px_rgba(139,92,246,0.4)]"
//         />
//         <input
//           type="text"
//           placeholder="Enter Destination"
//           value={destination}
//           onChange={(e) => setDestination(e.target.value)}
//           required
//           className="p-3 rounded-xl border border-indigo-300 bg-white shadow-inner transition duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent hover:shadow-[0_0_10px_rgba(139,92,246,0.4)]"
//         />
//         <input
//           type="time"
//           value={time}
//           onChange={(e) => setTime(e.target.value)}
//           required
//           className="p-3 rounded-xl border border-indigo-300 bg-white shadow-inner transition duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent hover:shadow-[0_0_10px_rgba(139,92,246,0.4)]"
//         />
//         <motion.button
//           whileHover={{ scale: 1.05 }}
//           whileTap={{ scale: 0.95 }}
//           type="submit"
//           className="bg-linear-to-r from-indigo-600 via-purple-500 to-pink-500 text-white py-3 cursor-pointer rounded-xl font-semibold shadow-lg hover:shadow-[0_0_20px_#8b5cf6] transition-all duration-300"
//         >
//           Predict Route
//         </motion.button>
//       </form>
//     </motion.div>
//   );
// }

import { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function InputCard({ onPredict }) {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [time, setTime] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!source.trim()) {
      return toast.error("Please enter a valid source city!");
    }
    if (!destination.trim()) {
      return toast.error("Please enter a valid destination city!");
    }
    if (!time.trim()) {
      return toast.error("Select a time for your trip!");
    }

    toast.success("✨ Prediction request submitted!");
    onPredict({ source, destination, time });
  };

  return (
    <motion.div
      className="max-w-2xl mx-auto mt-10 bg-white/80 backdrop-blur-xl border border-indigo-200 p-8 rounded-3xl shadow-2xl hover:shadow-purple-200 transition duration-500"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent mb-8">
        Enter Your Trip Details
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <input
          type="text"
          placeholder="Enter Source City"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          required
          className="p-3 rounded-xl border border-purple-200 focus:ring-2 focus:ring-indigo-400 focus:border-transparent shadow-inner bg-white/90"
        />
        <input
          type="text"
          placeholder="Enter Destination City"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          required
          className="p-3 rounded-xl border border-purple-200 focus:ring-2 focus:ring-indigo-400 focus:border-transparent shadow-inner bg-white/90"
        />
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          required
          className="p-3 rounded-xl border border-purple-200 focus:ring-2 focus:ring-indigo-400 focus:border-transparent shadow-inner bg-white/90"
        />

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          type="submit"
          className="bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-indigo-300 transition-all"
        >
          🚀 Predict Route
        </motion.button>
      </form>
    </motion.div>
  );
}
