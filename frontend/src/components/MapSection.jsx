import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { motion } from "framer-motion";

export default function MapSection({ geojson, distance, duration }) {
  return (
    <motion.div
      className="mt-12 w-full flex flex-col items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      <div className="w-full max-w-6xl h-[450px] rounded-3xl overflow-hidden shadow-2xl border border-purple-200">
        <MapContainer
          center={[22.5, 88.3]}
          zoom={11}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {geojson && (
            <GeoJSON data={geojson} style={{ color: "#7c3aed", weight: 5 }} />
          )}
        </MapContainer>
      </div>

      {geojson && (
        <div className="mt-4 w-11/12 max-w-3xl bg-white/80 backdrop-blur-xl text-indigo-800 text-lg font-semibold px-5 py-3 rounded-2xl shadow-md border border-indigo-200 flex justify-between items-center">
          <div>📏 Distance: {distance} km</div>
          <div>⏱ Duration: {duration} min</div>
        </div>
      )}
    </motion.div>
  );
}
