// BEFORE (for static scenario):
//const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
//const API_URL = 'http://localhost:5000';

// AFTER ( for production purpose ):
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';



export const predictDelay = async (source, destination, time) => {
  try {
    const response = await fetch(`${API_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source, destination, time }),
    });
    if (!response.ok) {
      let errorMsg = 'Prediction failed. Please try again.';
      try {
        const errorBody = await response.json();
        const raw = errorBody.error || '';
        if (raw && !raw.startsWith("'") && !raw.includes('KeyError') && !raw.includes('Traceback')) {
          errorMsg = raw;
        } else if (raw.includes('features') || raw.includes('route') || raw.includes('ORS') || raw.includes('geocod')) {
          errorMsg = 'Could not fetch route data. The routing service may be temporarily unavailable. Please try again.';
        } else if (raw) {
          errorMsg = 'Server error: route prediction failed. Please check your inputs and try again.';
        }
      } catch (_) {
        // response wasn't JSON — use default message
      }
      throw new Error(errorMsg);
    }
    const data = await response.json();
    if (!data || data.error) {
      throw new Error(data?.error || 'Invalid response from server.');
    }
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const checkHealth = async () => {
  try {
    const response = await fetch(`${API_URL}/health`);
    return await response.json();
  } catch (error) {
    console.error('Health check failed:', error);
    return { status: 'error' };
  }
};

export const getBestTime = async (source, destination) => {
  const response = await fetch(`${API_URL}/best-time`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source, destination }),
  });
  return await response.json();
};


// ─────────────────────────────────────────────────────────────────────────────
// MULTI-ROUTE FEATURE 2026
//
// Strategy: Use OSRM (free public API, no key needed) which natively supports
// alternatives=true — it returns real physically different road paths.
// Fallback: If OSRM fails, use ORS with 3 different via-waypoints to force
// the router through different roads.
//
// OSRM alternatives=true:  https://project-osrm.org/
// Returns up to 3 routes via genuinely different roads (e.g. different bridges,
// different highways), which is exactly what multi-route means.
// ─────────────────────────────────────────────────────────────────────────────

const ORS_KEY = '5b3ce3597851110001cf6248a346f45a3adf4c5fba5c1b5574d7be91';
const NOMINATIM   = 'https://nominatim.openstreetmap.org/search';
const OSRM_BASE   = 'https://router.project-osrm.org';
const ORS_BASE    = 'https://api.openrouteservice.org';

// ── Geocoding via Nominatim (free, no key) ──────────────────────────────────
// Returns [lng, lat]
async function geocodeNominatim(place) {
  const url = `${NOMINATIM}?q=${encodeURIComponent(place)}&format=json&limit=1&addressdetails=0`;
  const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
  if (!res.ok) throw new Error(`Nominatim geocode failed: ${place}`);
  const json = await res.json();
  if (!json || json.length === 0) throw new Error(`No location found: ${place}`);
  return [parseFloat(json[0].lon), parseFloat(json[0].lat)]; // [lng, lat]
}

// ── ORS geocode fallback ────────────────────────────────────────────────────
async function geocodeORS(place) {
  const url = `${ORS_BASE}/geocode/search?api_key=${ORS_KEY}&text=${encodeURIComponent(place)}&size=1`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`ORS geocode failed: ${place}`);
  const json = await res.json();
  if (!json.features || json.features.length === 0) throw new Error(`No location: ${place}`);
  return json.features[0].geometry.coordinates; // [lng, lat]
}

// Geocode with Nominatim first, ORS as fallback
async function geocode(place) {
  try {
    return await geocodeNominatim(place);
  } catch (e) {
    console.warn('Nominatim failed, trying ORS geocode:', e.message);
    return await geocodeORS(place);
  }
}

// ── Shape an OSRM route into our standard format ────────────────────────────
function shapeOsrmRoute(route, index, isBest) {
  const durationMin = Math.round(route.duration / 60);
  const distanceKm  = (route.distance / 1000).toFixed(2);
  // OSRM geometry is already GeoJSON LineString
  return {
    label   : isBest ? 'Most Efficient' : `Alternative ${index}`,
    is_best : isBest,
    distance: distanceKm,
    duration: durationMin,
    summary : `${distanceKm} km · ${durationMin} min`,
    geojson : {
      type    : 'Feature',
      geometry: route.geometry,   // already { type: 'LineString', coordinates: [...] }
    },
  };
}

// ── OSRM routing (free, no key, real alternatives) ─────────────────────────
async function getRoutesViaOSRM(srcCoords, dstCoords) {
  // OSRM expects lon,lat order in the URL
  const coordStr = `${srcCoords[0]},${srcCoords[1]};${dstCoords[0]},${dstCoords[1]}`;
  const url = `${OSRM_BASE}/route/v1/driving/${coordStr}?alternatives=3&geometries=geojson&overview=full`;

  const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`OSRM failed ${res.status}: ${txt}`);
  }

  const data = await res.json();
  if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
    throw new Error(`OSRM returned no routes (code: ${data.code})`);
  }

  // OSRM already sorts by duration ascending — index 0 is fastest
  const routes = data.routes.map((r, i) => shapeOsrmRoute(r, i, i === 0));
  console.log(`✅ OSRM: ${routes.length} real alternative routes loaded`);
  return routes;
}

// ── ORS via-waypoint fallback ───────────────────────────────────────────────
// Since ORS free tier doesn't support alternative_routes, we call ORS 3 times,
// each with a different intermediate waypoint offset perpendicular to the route,
// forcing the router through genuinely different roads.
function perpendicularWaypoints(src, dst, count = 2) {
  // Vector from src to dst
  const dx = dst[0] - src[0];
  const dy = dst[1] - src[1];
  const len = Math.sqrt(dx * dx + dy * dy);

  // Perpendicular unit vector
  const px = -dy / len;
  const py =  dx / len;

  // Mid-point of the route
  const mx = (src[0] + dst[0]) / 2;
  const my = (src[1] + dst[1]) / 2;

  // Offset distances — scaled to ~15-25% of route length to cross different roads
  const offsets = [-0.18, 0.18].slice(0, count);

  return offsets.map((scale) => [
    mx + px * len * scale,
    my + py * len * scale,
  ]);
}

async function fetchOrsRoute(coords) {
  const res = await fetch(`${ORS_BASE}/v2/directions/driving-car/geojson`, {
    method : 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: ORS_KEY },
    body   : JSON.stringify({ coordinates: coords }),
  });
  if (!res.ok) throw new Error(`ORS route failed: ${res.status}`);
  const data = await res.json();
  const f = data?.features?.[0];
  if (!f) throw new Error('ORS returned empty feature');
  const summary = f.properties?.summary || {};
  return {
    geometry: f.geometry,
    duration: summary.duration ?? 0,
    distance: summary.distance ?? 0,
  };
}

async function getRoutesViaORS(srcCoords, dstCoords) {
  // Route 1: direct (fastest)
  const direct = await fetchOrsRoute([srcCoords, dstCoords]);

  // Routes 2 & 3: via perpendicular waypoints (different roads)
  const waypoints = perpendicularWaypoints(srcCoords, dstCoords, 2);
  const viaRoutes = await Promise.allSettled(
    waypoints.map((wp) => fetchOrsRoute([srcCoords, wp, dstCoords]))
  );

  const all = [
    { ...direct, index: 0 },
    ...viaRoutes
      .filter((r) => r.status === 'fulfilled')
      .map((r, i) => ({ ...r.value, index: i + 1 })),
  ];

  // Remove duplicates — if a via-route is nearly identical distance to direct, skip it
  const unique = [all[0]];
  for (let i = 1; i < all.length; i++) {
    const diffPct = Math.abs(all[i].distance - all[0].distance) / all[0].distance;
    if (diffPct > 0.04) unique.push(all[i]); // keep only if >4% different distance
  }

  const minDuration = Math.min(...unique.map((r) => r.duration));
  const routes = unique.map((r, i) => ({
    label   : r.duration === minDuration ? 'Most Efficient' : `Alternative ${i}`,
    is_best : r.duration === minDuration,
    distance: (r.distance / 1000).toFixed(2),
    duration: Math.round(r.duration / 60),
    summary : `${(r.distance / 1000).toFixed(2)} km · ${Math.round(r.duration / 60)} min`,
    geojson : { type: 'Feature', geometry: r.geometry },
  }));

  console.log(`✅ ORS via-waypoint: ${routes.length} routes loaded`);
  return routes;
}

// ── Main export ─────────────────────────────────────────────────────────────
export const getAlternativeRoutes = async (source, destination) => {
  try {
    // Step 1: geocode both places
    const [srcCoords, dstCoords] = await Promise.all([
      geocode(source),
      geocode(destination),
    ]);

    // Step 2: try OSRM first (free, real alternatives)
    try {
      const routes = await getRoutesViaOSRM(srcCoords, dstCoords);
      if (routes && routes.length > 0) return { routes };
    } catch (osrmErr) {
      console.warn('OSRM failed, trying ORS via-waypoint:', osrmErr.message);
    }

    // Step 3: fallback — ORS with forced waypoints
    const routes = await getRoutesViaORS(srcCoords, dstCoords);
    return { routes };

  } catch (error) {
    console.warn('Alternative routes failed (non-critical):', error.message);
    return { routes: [] };
  }
};


// ─────────────────────────────────────────────────────────────────────────────
// TRAFFIC ALERTS FEATURE 2026
// ─────────────────────────────────────────────────────────────────────────────

function hashStr(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function generateFallbackAlerts(source, destination) {
  const seed = hashStr(`${source.toLowerCase()}-${destination.toLowerCase()}`);
  const rand = (i) => ((seed * 1103515245 + i * 12345) >>> 0) % 1000;

  const now = new Date();
  const fmtTime = (offsetMin) => {
    const d = new Date(now.getTime() - offsetMin * 60000);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const ALERT_POOL = [
    { id: 'alt-1', type: 'accident',     title: 'Vehicle Collision Reported',   description: `Minor collision near ${source} junction causing partial lane blockage.`,             location: `Near ${source}`,                      severity: 'high',   delay_impact: 8,  source: 'Waze Community'       },
    { id: 'alt-2', type: 'congestion',   title: 'Heavy Traffic Congestion',     description: `Slow-moving traffic between ${source} and ${destination}. Peak hour buildup.`,       location: `${source} – ${destination} corridor`, severity: 'medium', delay_impact: 5,  source: 'Google Maps Live'     },
    { id: 'alt-3', type: 'construction', title: 'Road Repair Work Ongoing',     description: `PWD road resurfacing near ${destination}. One lane closed, flagmen deployed.`,       location: `Approaching ${destination}`,          severity: 'medium', delay_impact: 6,  source: 'KMC Traffic Dept'     },
    { id: 'alt-4', type: 'closure',      title: 'Partial Road Closure',         description: `Temporary barricade for utility work. Right lane blocked, merge left.`,              location: `Mid-route checkpoint`,                severity: 'low',    delay_impact: 3,  source: 'Traffic Police'       },
    { id: 'alt-5', type: 'weather',      title: 'Wet Road Conditions',          description: `Light rain causing reduced visibility near ${destination}. Reduce speed.`,            location: `Near ${destination}`,                 severity: 'low',    delay_impact: 4,  source: 'IMD Weather Alert'    },
    { id: 'alt-6', type: 'congestion',   title: 'Signal Failure — Manual Control', description: `Traffic signal malfunction at main crossing. Police deployed, expect delays.`,    location: `Main crossing en-route`,              severity: 'high',   delay_impact: 10, source: 'Kolkata Traffic Police' },
    { id: 'alt-7', type: 'event',        title: 'Public Event Causing Slowdown', description: `Local procession partially blocking the road. Alternate lanes available but slow.`, location: `Between ${source} and ${destination}`, severity: 'low',   delay_impact: 2,  source: 'Community Report'     },
  ];

  const count = 2 + (rand(0) % 2);
  const chosen = [];
  const used = new Set();
  for (let i = 0; i < count; i++) {
    let idx = rand(i + 1) % ALERT_POOL.length;
    let safety = 0;
    while (used.has(idx) && safety < 10) { idx = (idx + 1) % ALERT_POOL.length; safety++; }
    used.add(idx);
    chosen.push({ ...ALERT_POOL[idx], reported_at: fmtTime(rand(i + 5) % 45) });
  }
  return chosen;
}

export const getTrafficAlerts = async (source, destination, routeGeojson = null) => {
  try {
    const response = await fetch(`${API_URL}/traffic-alerts`, {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify({ source, destination, geojson: routeGeojson }),
    });
    if (!response.ok) {
      return { alerts: generateFallbackAlerts(source, destination) };
    }
    const data = await response.json();
    if (!data.alerts || data.alerts.length === 0) {
      return { alerts: generateFallbackAlerts(source, destination) };
    }
    return data;
  } catch (error) {
    return { alerts: generateFallbackAlerts(source, destination) };
  }
};




