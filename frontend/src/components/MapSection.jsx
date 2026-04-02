// import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMap } from 'react-leaflet';
// import 'leaflet/dist/leaflet.css';
// import { motion } from 'framer-motion';
// import L from 'leaflet';
// import { useEffect } from 'react';
// import RouteLegend from './RouteLegend';

// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
//   iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
//   shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
// });

// // Auto-fit map bounds to show all routes
// function FitBounds({ geojson, alternativeRoutes }) {
//   const map = useMap();

//   useEffect(() => {
//     try {
//       // Prefer fitting to alternative routes if present
//       if (alternativeRoutes && alternativeRoutes.length > 0) {
//         const allCoords = [];
//         alternativeRoutes.forEach((route) => {
//           const coords = route.geojson?.geometry?.coordinates;
//           if (coords) coords.forEach(([lng, lat]) => allCoords.push([lat, lng]));
//         });
//         if (allCoords.length > 0) {
//           map.fitBounds(allCoords, { padding: [40, 40] });
//           return;
//         }
//       }
//       // Fallback: fit to single geojson
//       if (geojson) {
//         const layer = L.geoJSON(geojson);
//         map.fitBounds(layer.getBounds(), { padding: [40, 40] });
//       }
//     } catch (e) {
//       // silently ignore fitBounds errors
//     }
//   }, [geojson, alternativeRoutes, map]);

//   return null;
// }

// const createIncidentIcon = (emoji, severity) => {
//   const colors = { high: '#ef4444', medium: '#f59e0b', low: '#22c55e' };
//   const color = colors[severity] || colors.medium;
//   return L.divIcon({
//     className: '',
//     html: `<div style="background:${color};border:2px solid white;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 2px 8px rgba(0,0,0,0.35);cursor:pointer;">${emoji}</div>`,
//     iconSize: [32, 32],
//     iconAnchor: [16, 16],
//     popupAnchor: [0, -18],
//   });
// };

// const TYPE_ICONS = {
//   accident: '💥', construction: '🚧', closure: '🚫',
//   congestion: '🚗', weather: '🌧️', event: '🎉', default: '⚠️',
// };

// export default function MapSection({ geojson, distance, duration, alerts, alternativeRoutes }) {
//   const hasMultipleRoutes = alternativeRoutes && alternativeRoutes.length > 1;
//   const totalRoutes = hasMultipleRoutes ? alternativeRoutes.length : (geojson ? 1 : 0);

//   return (
//     <motion.div
//       className="mt-10 w-full flex flex-col items-center"
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       transition={{ delay: 0.4 }}
//     >
//       <div className="w-full max-w-6xl h-[400px] rounded-2xl overflow-hidden shadow-xl border border-gray-200 relative">
//         <MapContainer
//           center={[22.5, 88.3]}
//           zoom={11}
//           scrollWheelZoom={true}
//           style={{ height: '100%', width: '100%' }}
//         >
//           <TileLayer
//             attribution='&copy; OpenStreetMap contributors'
//             url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//           />

//           {/* Auto-fit bounds whenever routes change */}
//           <FitBounds geojson={geojson} alternativeRoutes={alternativeRoutes} />

//           {/* MULTI-ROUTE: green alternatives first, red best on top */}
//           {hasMultipleRoutes ? (
//             <>
//               {alternativeRoutes
//                 .filter((r) => !r.is_best)
//                 .map((route, i) => (
//                   <GeoJSON
//                     key={`alt-${i}`}
//                     data={route.geojson}
//                     style={{ color: '#22c55e', weight: 5, opacity: 0.85, dashArray: '8 4' }}
//                   >
//                     <Popup>
//                       <div style={{ minWidth: '170px' }}>
//                         <p style={{ fontWeight: '700', fontSize: '13px', marginBottom: '4px' }}>
//                           🟢 {route.label}
//                         </p>
//                         <p style={{ fontSize: '12px', color: '#555' }}>📏 {route.distance} km</p>
//                         <p style={{ fontSize: '12px', color: '#555' }}>⏱ {route.duration} min</p>
//                       </div>
//                     </Popup>
//                   </GeoJSON>
//                 ))}

//               {alternativeRoutes
//                 .filter((r) => r.is_best)
//                 .map((route, i) => (
//                   <GeoJSON
//                     key={`best-${i}`}
//                     data={route.geojson}
//                     style={{ color: '#ef4444', weight: 7, opacity: 1 }}
//                   >
//                     <Popup>
//                       <div style={{ minWidth: '170px' }}>
//                         <p style={{ fontWeight: '700', fontSize: '13px', marginBottom: '4px' }}>
//                           🔴 Most Efficient Route
//                         </p>
//                         <p style={{ fontSize: '12px', color: '#555' }}>📏 {route.distance} km</p>
//                         <p style={{ fontSize: '12px', color: '#555' }}>⏱ {route.duration} min</p>
//                       </div>
//                     </Popup>
//                   </GeoJSON>
//                 ))}
//             </>
//           ) : (
//             // Fallback: single purple route (original behaviour)
//             geojson && <GeoJSON data={geojson} style={{ color: '#7c3aed', weight: 5 }} />
//           )}

//           {/* Incident markers */}
//           {alerts && alerts.map((alert, i) => {
//             if (!alert.coordinates) return null;
//             const [lat, lng] = alert.coordinates;
//             const emoji = TYPE_ICONS[alert.type] || TYPE_ICONS.default;
//             return (
//               <Marker key={alert.id || i} position={[lat, lng]} icon={createIncidentIcon(emoji, alert.severity)}>
//                 <Popup>
//                   <div style={{ minWidth: '180px' }}>
//                     <p style={{ fontWeight: 'bold', marginBottom: '4px', fontSize: '13px' }}>{emoji} {alert.title}</p>
//                     <p style={{ fontSize: '12px', color: '#555', marginBottom: '4px' }}>{alert.description}</p>
//                     {alert.delay_impact && (
//                       <p style={{ fontSize: '12px', color: '#ef4444', fontWeight: '600' }}>⏱ +{alert.delay_impact} min delay</p>
//                     )}
//                     <p style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>📍 {alert.location}</p>
//                   </div>
//                 </Popup>
//               </Marker>
//             );
//           })}
//         </MapContainer>

//         {hasMultipleRoutes && <RouteLegend routeCount={totalRoutes} />}
//       </div>

//       {(geojson || hasMultipleRoutes) && (() => {
//         const bestRoute = hasMultipleRoutes ? alternativeRoutes.find((r) => r.is_best) : null;
//         const displayDistance = bestRoute ? bestRoute.distance : distance;
//         const displayDuration = bestRoute ? bestRoute.duration : duration;
//         return (
//           <div className="mt-2 w-11/12 bg-indigo-50 text-indigo-700 text-lg font-bold px-4 py-2 rounded-md shadow border border-indigo-300 flex justify-between items-center">
//             <div>Travel Distance: {displayDistance} km</div>
//             <div>Travel Duration Without Delay: {displayDuration} min</div>
//           </div>
//         );
//       })()}
//     </motion.div>
//   );
// }









// NEW CODE 

import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { motion } from 'framer-motion';
import L from 'leaflet';
import { useEffect } from 'react';
import RouteLegend from './RouteLegend';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Auto-fit map bounds to show all routes
function FitBounds({ geojson, alternativeRoutes }) {
  const map = useMap();

  useEffect(() => {
    try {
      if (alternativeRoutes && alternativeRoutes.length > 0) {
        const allCoords = [];
        alternativeRoutes.forEach((route) => {
          const coords = route.geojson?.geometry?.coordinates;
          if (coords) coords.forEach(([lng, lat]) => allCoords.push([lat, lng]));
        });
        if (allCoords.length > 0) {
          map.fitBounds(allCoords, { padding: [40, 40] });
          return;
        }
      }
      if (geojson) {
        const layer = L.geoJSON(geojson);
        map.fitBounds(layer.getBounds(), { padding: [40, 40] });
      }
    } catch (e) {
      // silently ignore fitBounds errors
    }
  }, [geojson, alternativeRoutes, map]);

  return null;
}

const createIncidentIcon = (emoji, severity) => {
  const colors = { high: '#ef4444', medium: '#f59e0b', low: '#22c55e' };
  const color = colors[severity] || colors.medium;
  return L.divIcon({
    className: '',
    html: `<div style="background:${color};border:2px solid white;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 2px 8px rgba(0,0,0,0.35);cursor:pointer;">${emoji}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  });
};

const TYPE_ICONS = {
  accident: '💥', construction: '🚧', closure: '🚫',
  congestion: '🚗', weather: '🌧️', event: '🎉', default: '⚠️',
};

export default function MapSection({ geojson, distance, duration, alerts, alternativeRoutes }) {
  const hasMultipleRoutes = alternativeRoutes && alternativeRoutes.length > 1;
  const totalRoutes = hasMultipleRoutes ? alternativeRoutes.length : (geojson ? 1 : 0);

  return (
    <motion.div
      className="mt-10 w-full flex flex-col items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
    >
      <div className="w-full max-w-6xl h-[400px] rounded-2xl overflow-hidden shadow-xl border border-gray-200 relative">
        <MapContainer
          center={[22.5, 88.3]}
          zoom={11}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <FitBounds geojson={geojson} alternativeRoutes={alternativeRoutes} />

          {hasMultipleRoutes ? (
            <>
              {/* ── RED dashed lines: alternative (non-best) routes drawn first (below) ── */}
              {alternativeRoutes
                .filter((r) => !r.is_best)
                .map((route, i) => (
                  <GeoJSON
                    key={`alt-${i}`}
                    data={route.geojson}
                    style={{ color: '#ef4444', weight: 5, opacity: 0.85, dashArray: '8 4' }}
                  >
                    <Popup>
                      <div style={{ minWidth: '170px' }}>
                        <p style={{ fontWeight: '700', fontSize: '13px', marginBottom: '4px' }}>
                          🔴 {route.label}
                        </p>
                        <p style={{ fontSize: '12px', color: '#555' }}>📏 {route.distance} km</p>
                        <p style={{ fontSize: '12px', color: '#555' }}>⏱ {route.duration} min</p>
                      </div>
                    </Popup>
                  </GeoJSON>
                ))}

              {/* ── GREEN solid line: most efficient route drawn on top ── */}
              {alternativeRoutes
                .filter((r) => r.is_best)
                .map((route, i) => (
                  <GeoJSON
                    key={`best-${i}`}
                    data={route.geojson}
                    style={{ color: '#16a34a', weight: 7, opacity: 1 }}
                  >
                    <Popup>
                      <div style={{ minWidth: '170px' }}>
                        <p style={{ fontWeight: '700', fontSize: '13px', marginBottom: '4px' }}>
                          🟢 Most Efficient Route
                        </p>
                        <p style={{ fontSize: '12px', color: '#555' }}>📏 {route.distance} km</p>
                        <p style={{ fontSize: '12px', color: '#555' }}>⏱ {route.duration} min</p>
                      </div>
                    </Popup>
                  </GeoJSON>
                ))}
            </>
          ) : (
            // Fallback: single purple route (original behaviour when ORS hasn't loaded yet)
            geojson && <GeoJSON data={geojson} style={{ color: '#7c3aed', weight: 5 }} />
          )}

          {/* Incident markers */}
          {alerts && alerts.map((alert, i) => {
            if (!alert.coordinates) return null;
            const [lat, lng] = alert.coordinates;
            const emoji = TYPE_ICONS[alert.type] || TYPE_ICONS.default;
            return (
              <Marker key={alert.id || i} position={[lat, lng]} icon={createIncidentIcon(emoji, alert.severity)}>
                <Popup>
                  <div style={{ minWidth: '180px' }}>
                    <p style={{ fontWeight: 'bold', marginBottom: '4px', fontSize: '13px' }}>{emoji} {alert.title}</p>
                    <p style={{ fontSize: '12px', color: '#555', marginBottom: '4px' }}>{alert.description}</p>
                    {alert.delay_impact && (
                      <p style={{ fontSize: '12px', color: '#ef4444', fontWeight: '600' }}>⏱ +{alert.delay_impact} min delay</p>
                    )}
                    <p style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>📍 {alert.location}</p>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {hasMultipleRoutes && <RouteLegend routeCount={totalRoutes} />}
      </div>

      {(geojson || hasMultipleRoutes) && (() => {
        const bestRoute = hasMultipleRoutes ? alternativeRoutes.find((r) => r.is_best) : null;
        const displayDistance = bestRoute ? bestRoute.distance : distance;
        const displayDuration = bestRoute ? bestRoute.duration : duration;
        return (
          <div className="mt-2 w-11/12 bg-indigo-50 text-indigo-700 text-lg font-bold px-4 py-2 rounded-md shadow border border-indigo-300 flex justify-between items-center">
            <div>Travel Distance: {displayDistance} km</div>
            <div>Travel Duration Without Delay: {displayDuration} min</div>
          </div>
        );
      })()}
    </motion.div>
  );
}



