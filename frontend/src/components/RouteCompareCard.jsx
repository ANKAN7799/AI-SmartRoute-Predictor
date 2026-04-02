// // MULTI-ROUTE COMPARE CARD 2026
// import { motion } from 'framer-motion';

// export default function RouteCompareCard({ routes }) {
//   if (!routes || routes.length === 0) return null;

//   return (
//     <motion.div
//       className="max-w-2xl mx-auto mt-6 bg-white/80 backdrop-blur-sm p-5 rounded-3xl shadow-xl border border-indigo-200 ring-1 ring-purple-100"
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.5 }}
//     >
//       <h3 className="text-xl font-bold text-indigo-700 mb-4 tracking-wide">
//         🛣️ Route Comparison
//       </h3>

//       <div className="space-y-3">
//         {routes.map((route, i) => (
//           <motion.div
//             key={i}
//             initial={{ opacity: 0, x: -15 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ delay: i * 0.07 }}
//             className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 shadow-sm ${
//               route.is_best
//                 ? 'bg-red-50 border-red-400'
//                 : 'bg-green-50 border-green-300'
//             }`}
//           >
//             {/* Color indicator stripe */}
//             <div className="flex items-center gap-3 flex-1 min-w-0">
//               <div
//                 className="w-3 h-10 rounded-full flex-shrink-0"
//                 style={{ background: route.is_best ? '#ef4444' : '#22c55e' }}
//               />
//               <div className="min-w-0">
//                 <p className={`font-bold text-sm truncate ${route.is_best ? 'text-red-700' : 'text-green-700'}`}>
//                   {route.is_best ? '🔴 Most Efficient' : `🟢 ${route.label || `Alternative ${i}`}`}
//                 </p>
//                 {route.summary && (
//                   <p className="text-xs text-gray-500 truncate">{route.summary}</p>
//                 )}
//               </div>
//             </div>

//             {/* Stats */}
//             <div className="flex gap-4 flex-shrink-0 text-right">
//               <div>
//                 <p className="text-xs text-gray-400">Distance</p>
//                 <p className="text-sm font-bold text-gray-700">{route.distance} km</p>
//               </div>
//               <div>
//                 <p className="text-xs text-gray-400">Duration</p>
//                 <p className="text-sm font-bold text-gray-700">{route.duration} min</p>
//               </div>
//               {route.is_best && (
//                 <div className="flex items-center">
//                   <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full font-semibold">
//                     Best
//                   </span>
//                 </div>
//               )}
//             </div>
//           </motion.div>
//         ))}
//       </div>

//       <p className="text-xs text-gray-400 mt-3 text-center">
//         Click any route on the map to see its details
//       </p>
//     </motion.div>
//   );
// }













// NEW CODE 

// MULTI-ROUTE COMPARE CARD 2026
import { motion } from 'framer-motion';

export default function RouteCompareCard({ routes }) {
  if (!routes || routes.length === 0) return null;

  return (
    <motion.div
      className="max-w-2xl mx-auto mt-6 bg-white/80 backdrop-blur-sm p-5 rounded-3xl shadow-xl border border-indigo-200 ring-1 ring-purple-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-xl font-bold text-indigo-700 mb-4 tracking-wide">
        🛣️ Route Comparison
      </h3>

      <div className="space-y-3">
        {routes.map((route, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07 }}
            className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 shadow-sm ${
              route.is_best
                ? 'bg-green-50 border-green-400'   // GREEN for most efficient
                : 'bg-red-50 border-red-300'         // RED for alternatives
            }`}
          >
            {/* Colour indicator stripe */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div
                className="w-3 h-10 rounded-full flex-shrink-0"
                style={{ background: route.is_best ? '#16a34a' : '#ef4444' }}
              />
              <div className="min-w-0">
                <p className={`font-bold text-sm truncate ${route.is_best ? 'text-green-700' : 'text-red-700'}`}>
                  {route.is_best ? '🟢 Most Efficient' : `🔴 ${route.label || `Alternative ${i}`}`}
                </p>
                {route.summary && (
                  <p className="text-xs text-gray-500 truncate">{route.summary}</p>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-4 flex-shrink-0 text-right">
              <div>
                <p className="text-xs text-gray-400">Distance</p>
                <p className="text-sm font-bold text-gray-700">{route.distance} km</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Duration</p>
                <p className="text-sm font-bold text-gray-700">{route.duration} min</p>
              </div>
              {route.is_best && (
                <div className="flex items-center">
                  <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full font-semibold">
                    Best
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <p className="text-xs text-gray-400 mt-3 text-center">
        Click any route on the map to see its details
      </p>
    </motion.div>
  );
}




