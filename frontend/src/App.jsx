// import { useState } from 'react';
// import './App.css';
// import Header from './components/Header';
// import InputCard from './components/Inputcard';
// import MapSection from './components/MapSection';
// import ResultCard from './components/Resultcard';
// import Footer from './components/Footer';
// import { predictDelay, getBestTime, getTrafficAlerts } from './services/api';
// import BestTimeCard from './components/BestTimeCard';
// import TrafficAlertsCard from './components/TrafficAlertsCard';

// export default function App() {
//   const [geojson, setGeojson] = useState(null);
//   const [duration, setDuration] = useState(null);
//   const [distance, setDistance] = useState(null);
//   const [result, setResult] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const [bestTimeData, setBestTimeData] = useState(null);

//   // ✅ TRAFFIC ALERTS STATE
//   const [alerts, setAlerts] = useState([]);
//   const [alertsLoading, setAlertsLoading] = useState(false);
//   const [currentRoute, setCurrentRoute] = useState({ source: '', destination: '' });

//   const handlePredict = async ({ source, destination, time }) => {
//     setLoading(true);
//     setError(null);
//     setCurrentRoute({ source, destination });
//     setAlerts([]); // reset alerts on each new search

//     try {
//       const data = await predictDelay(source, destination, time);
//       setResult(data);
//       setGeojson(data.geojson);
//       setDuration(data.duration);
//       setDistance(data.distance);

//       // ✅ BEST TIME CALL
//       const bestTime = await getBestTime(source, destination);
//       setBestTimeData(bestTime);

//       // ✅ TRAFFIC ALERTS CALL (non-blocking — runs after main prediction)
//       setAlertsLoading(true);
//       getTrafficAlerts(source, destination, data.geojson)
//         .then((alertData) => {
//           setAlerts(alertData.alerts || []);
//         })
//         .finally(() => {
//           setAlertsLoading(false);
//         });

//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };


//   return (
//     <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-50 flex flex-col">
//       <Header />
//       <InputCard onPredict={handlePredict} />

//       {error && (
//         <div className="max-w-xl mx-auto mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl">
//           <p className="font-bold">Error:</p>
//           <p>{error}</p>
//         </div>
//       )}

//       {loading && (
//         <div className="flex flex-col items-center mt-6 text-indigo-600 font-semibold">
//           <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-indigo-500 mb-3"></div>
//           <p className="animate-pulse">🚀 Predicting route delay... hang tight!</p>
//         </div>
//       )}

//       <MapSection geojson={geojson} distance={distance} duration={duration} />

//       <ResultCard result={result} />

//       {/* ✅ TRAFFIC ALERTS CARD */}
//       <TrafficAlertsCard
//         alerts={alerts}
//         loading={alertsLoading}
//         source={currentRoute.source}
//         destination={currentRoute.destination}
//       />

//       {/* ✅ BEST TIME CARD */}
//       <BestTimeCard data={bestTimeData} />

//       <Footer />
//     </div>
//   );
// }





// NEW CODE 

import { useState } from 'react';
import './App.css';
import Header from './components/Header';
import InputCard from './components/Inputcard';
import MapSection from './components/MapSection';
import ResultCard from './components/Resultcard';
import Footer from './components/Footer';
import { predictDelay, getBestTime, getTrafficAlerts, getAlternativeRoutes } from './services/api';
import BestTimeCard from './components/BestTimeCard';
import TrafficAlertsCard from './components/TrafficAlertsCard';
import RouteCompareCard from './components/RouteCompareCard';

export default function App() {
  const [geojson, setGeojson] = useState(null);
  const [duration, setDuration] = useState(null);
  const [distance, setDistance] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [bestTimeData, setBestTimeData] = useState(null);

  // ✅ TRAFFIC ALERTS STATE
  const [alerts, setAlerts] = useState([]);
  const [alertsLoading, setAlertsLoading] = useState(false);
  const [currentRoute, setCurrentRoute] = useState({ source: '', destination: '' });

  // ✅ MULTI-ROUTE STATE
  const [alternativeRoutes, setAlternativeRoutes] = useState([]);

  const handlePredict = async ({ source, destination, time }) => {
    setLoading(true);
    setError(null);
    setCurrentRoute({ source, destination });
    setAlerts([]);
    setAlternativeRoutes([]); // reset routes on each new search

    try {
      const data = await predictDelay(source, destination, time);
      setResult(data);
      setGeojson(data.geojson);
      setDuration(data.duration);
      setDistance(data.distance);

      // ✅ BEST TIME CALL
      const bestTime = await getBestTime(source, destination);
      setBestTimeData(bestTime);

      // ✅ TRAFFIC ALERTS CALL (non-blocking)
      setAlertsLoading(true);
      getTrafficAlerts(source, destination, data.geojson)
        .then((alertData) => {
          setAlerts(alertData.alerts || []);
        })
        .finally(() => {
          setAlertsLoading(false);
        });

      // ✅ ALTERNATIVE ROUTES CALL (non-blocking)
      // Calls ORS directly from frontend — no backend needed.
      // Most efficient route → GREEN on map, alternatives → RED (dashed).
      getAlternativeRoutes(source, destination)
        .then((routeData) => {
          if (routeData.routes && routeData.routes.length > 0) {
            setAlternativeRoutes(routeData.routes);
          }
        });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-50 flex flex-col">
      <Header />
      <InputCard onPredict={handlePredict} />

      {error && (
        <div className="max-w-xl mx-auto mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center mt-6 text-indigo-600 font-semibold">
          <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-indigo-500 mb-3"></div>
          <p className="animate-pulse">🚀 Predicting route delay... hang tight!</p>
        </div>
      )}

      {/* Map receives alternativeRoutes → GREEN = most efficient, RED dashed = alternatives */}
      <MapSection
        geojson={geojson}
        distance={distance}
        duration={duration}
        alerts={alerts}
        alternativeRoutes={alternativeRoutes}
      />

      {/* ✅ ROUTE COMPARE CARD — appears below map once routes load */}
      <RouteCompareCard routes={alternativeRoutes} />

      <ResultCard result={result} />

      {/* ✅ TRAFFIC ALERTS CARD */}
      <TrafficAlertsCard
        alerts={alerts}
        loading={alertsLoading}
        source={currentRoute.source}
        destination={currentRoute.destination}
      />

      {/* ✅ BEST TIME CARD */}
      <BestTimeCard data={bestTimeData} />

      <Footer />
    </div>
  );
}














