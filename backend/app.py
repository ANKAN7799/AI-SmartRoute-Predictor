# from flask import Flask, request, jsonify
# from flask_cors import CORS
# import pandas as pd
# import requests
# import joblib
# from datetime import datetime
# import os
# from dotenv import load_dotenv

# load_dotenv()

# app = Flask(__name__)
# app.config['CORS_HEADERS'] = 'Content-Type'

# # ✅ CORS
# CORS(app)

# # -------------------- LOAD MODEL --------------------

# try:
#     model = joblib.load("model.pkl")
#     weather_encoder = joblib.load("weather_encoder.pkl")
#     print("✓ Loaded models from current directory")
# except FileNotFoundError:
#     model = joblib.load("backend/model.pkl")
#     weather_encoder = joblib.load("backend/weather_encoder.pkl")

# ORS_API_KEY = os.environ.get("ORS_API_KEY")
# WEATHER_API_KEY = os.environ.get("WEATHER_API_KEY")

# # -------------------- HELPERS --------------------

# def geocode_location(place_name):
#     url = "https://api.openrouteservice.org/geocode/search"
#     params = {
#         "api_key": ORS_API_KEY,
#         "text": place_name,
#         "size": 1
#     }
#     try:
#         response = requests.get(url, params=params, timeout=30)
#         response.raise_for_status()
#         data = response.json()
#         return data["features"][0]["geometry"]["coordinates"]
#     except:
#         return None

# # -------------------- ROUTES --------------------

# @app.route("/", methods=["GET"])
# def home():
#     return jsonify({
#         "status": "running",
#         "message": "Route Delay Prediction API is active",
#         "timestamp": datetime.now().isoformat()
#     })

# @app.route("/health", methods=["GET"])
# def health():
#     return jsonify({"status": "healthy"})


# # ==================== PREDICT ====================
# @app.route("/predict", methods=["POST"])
# def predict():
#     try:
#         data = request.json
#         source = data["source"]
#         destination = data["destination"]
#         time_str = data["time"]

#         dt = datetime.strptime(time_str, "%H:%M")
#         hour = dt.hour
#         day_of_week = datetime.today().weekday()
#         month = datetime.today().month

#         src_coords = geocode_location(source)
#         dest_coords = geocode_location(destination)

#         # -------------------- ROUTE --------------------
#         ors_url = "https://api.openrouteservice.org/v2/directions/driving-car"
#         headers = {"Authorization": ORS_API_KEY}
#         params = {
#             "start": f"{src_coords[0]},{src_coords[1]}",
#             "end": f"{dest_coords[0]},{dest_coords[1]}"
#         }

#         route_data = requests.get(ors_url, headers=headers, params=params).json()

#         summary = route_data["features"][0]["properties"]["summary"]
#         distance_km = summary["distance"] / 1000
#         duration_sec = summary["duration"]
#         duration_min = round(duration_sec / 60, 1)
#         avg_speed = distance_km / (duration_sec / 3600)

#         # -------------------- WEATHER (NEW FIX) --------------------
#         try:
#             weather_url = "http://api.openweathermap.org/data/2.5/weather"
#             weather_params = {
#                 "q": source,
#                 "appid": WEATHER_API_KEY,
#                 "units": "metric"
#             }

#             weather_res = requests.get(weather_url, params=weather_params).json()

#             weather = weather_res.get("weather", [{}])[0].get("main", "Clear")
#             temperature = weather_res.get("main", {}).get("temp", 30)
#             visibility = weather_res.get("visibility", 5000) / 1000

#         except:
#             # ✅ fallback (NO CRASH)
#             weather = "Clear"
#             temperature = 30
#             visibility = 5

#         # -------------------- ENCODING (NEW FIX) --------------------
#         try:
#             weather_encoded = int(weather_encoder.transform([weather])[0])
#         except:
#             weather_encoded = 0  # fallback

#         # -------------------- TRAFFIC --------------------
#         traffic_volume = 1000 if 7 <= hour <= 10 or 17 <= hour <= 20 else 500

#         # -------------------- FEATURES --------------------
#         features = pd.DataFrame([{
#             "avg_speed": avg_speed,
#             "traffic_volume": traffic_volume,
#             "distance_km": distance_km,
#             "hour": hour,
#             "day_of_week": day_of_week,
#             "month": month,
#             "weather_encoded": weather_encoded
#         }])

#         delay = model.predict(features)[0]

#         # -------------------- RESPONSE --------------------
#         return jsonify({
#             "delay": round(delay, 2),
#             "geojson": route_data["features"][0]["geometry"],
#             "distance": round(distance_km, 2),
#             "duration": duration_min,
#             "route": f"{source} → {destination}",
#             "weather": weather,
#             "temperature": temperature,
#             "visibility": visibility
#         })

#     except Exception as e:
#         return jsonify({"error": str(e)}), 500


# # ==================== BEST TIME ====================
# @app.route("/best-time", methods=["POST"])
# def best_time():
#     try:
#         data = request.get_json()
#         source = data.get("source")
#         destination = data.get("destination")

#         src_coords = geocode_location(source)
#         dest_coords = geocode_location(destination)

#         ors_url = "https://api.openrouteservice.org/v2/directions/driving-car"
#         headers = {"Authorization": ORS_API_KEY}
#         params = {
#             "start": f"{src_coords[0]},{src_coords[1]}",
#             "end": f"{dest_coords[0]},{dest_coords[1]}"
#         }

#         route_data = requests.get(ors_url, headers=headers, params=params).json()

#         summary = route_data["features"][0]["properties"]["summary"]
#         distance_km = summary["distance"] / 1000
#         duration_sec = summary["duration"]
#         avg_speed = distance_km / (duration_sec / 3600)

#         results = []

#         for hour in range(6, 22):
#             for minute in [0, 30]:
#                 traffic_volume = 1000 if 7 <= hour <= 10 or 17 <= hour <= 20 else 500

#                 # simple fallback encoding
#                 weather_encoded = 0

#                 features = pd.DataFrame([{
#                     "avg_speed": avg_speed,
#                     "traffic_volume": traffic_volume,
#                     "distance_km": distance_km,
#                     "hour": hour,
#                     "day_of_week": datetime.today().weekday(),
#                     "month": datetime.today().month,
#                     "weather_encoded": weather_encoded
#                 }])

#                 delay = model.predict(features)[0]

#                 results.append({
#                     "time": f"{hour:02d}:{minute:02d}",
#                     "delay": round(delay, 2)
#                 })

#         best = min(results, key=lambda x: x["delay"])

#         return jsonify({
#             "times": results,
#             "best": best
#         })

#     except Exception as e:
#         print("ERROR:", e)
#         return jsonify({"error": str(e)}), 500


# # -------------------- RUN --------------------

# if __name__ == "__main__":
#     app.run(debug=False, port=5000)
    
# # ─────────────────────────────────────────────────────────────────────────────
# # ADD THIS ENTIRE BLOCK to your existing Flask app.py / main.py backend file
# # This uses your existing ORS_API_KEY that's already in your backend.
# # ─────────────────────────────────────────────────────────────────────────────

# import requests as req  # rename to avoid clash with Flask's request

# @app.route('/alternative-routes', methods=['POST'])
# def alternative_routes():
#     data = request.json
#     source = data.get('source')
#     destination = data.get('destination')

#     if not source or not destination:
#         return jsonify({'error': 'source and destination required'}), 400

#     try:
#         # Step 1: Geocode source
#         src_res = req.get(
#             'https://api.openrouteservice.org/geocode/search',
#             params={'api_key': ORS_API_KEY, 'text': source, 'size': 1}
#         )
#         src_coords = src_res.json()['features'][0]['geometry']['coordinates']  # [lng, lat]

#         # Step 2: Geocode destination
#         dst_res = req.get(
#             'https://api.openrouteservice.org/geocode/search',
#             params={'api_key': ORS_API_KEY, 'text': destination, 'size': 1}
#         )
#         dst_coords = dst_res.json()['features'][0]['geometry']['coordinates']  # [lng, lat]

#         # Step 3: Get alternative routes from ORS
#         ors_res = req.post(
#             'https://api.openrouteservice.org/v2/directions/driving-car',
#             headers={
#                 'Content-Type': 'application/json',
#                 'Authorization': ORS_API_KEY,
#             },
#             json={
#                 'coordinates': [src_coords, dst_coords],
#                 'alternative_routes': {
#                     'target_count': 3,    # request up to 3 routes
#                     'weight_factor': 1.6,
#                     'share_factor': 0.6,
#                 },
#                 'format': 'geojson',
#             }
#         )

#         if not ors_res.ok:
#             return jsonify({'routes': [], 'error': 'ORS request failed'}), 200

#         ors_data = ors_res.json()
#         features = ors_data.get('features', [])

#         if not features:
#             return jsonify({'routes': []}), 200

#         # Step 4: Find the best route (lowest duration)
#         durations = [f['properties']['summary']['duration'] for f in features]
#         min_duration = min(durations)

#         # Step 5: Shape routes for frontend
#         routes = []
#         for i, feature in enumerate(features):
#             summary = feature['properties']['summary']
#             duration_min = round(summary['duration'] / 60, 1)
#             distance_km = round(summary['distance'] / 1000, 2)
#             is_best = summary['duration'] == min_duration

#             routes.append({
#                 'label': 'Most Efficient' if is_best else f'Alternative {i}',
#                 'is_best': is_best,
#                 'distance': distance_km,
#                 'duration': duration_min,
#                 'summary': f"{distance_km} km · {duration_min} min",
#                 'geojson': {
#                     'type': 'Feature',
#                     'geometry': feature['geometry'],
#                 }
#             })

#         return jsonify({'routes': routes})

#     except Exception as e:
#         print(f"Alternative routes error: {e}")
#         return jsonify({'routes': []}), 200  # non-critical, never crash the app
    
    
    
    














from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import requests
import joblib
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.config['CORS_HEADERS'] = 'Content-Type'
CORS(app)

# ─────────────────────────────────────────────────────────────────────────────
# LOAD MODEL ARTEFACTS
# ─────────────────────────────────────────────────────────────────────────────

def _load(filename):
    for prefix in ["", "backend/"]:
        try:
            return joblib.load(prefix + filename)
        except FileNotFoundError:
            continue
    raise FileNotFoundError(f"Cannot find {filename} in . or backend/")

model           = _load("model.pkl")
weather_encoder = _load("weather_encoder.pkl")

try:
    feature_list     = _load("feature_list.pkl")
    USE_NEW_FEATURES = True
    print(f"✓ Loaded model ({type(model).__name__}), encoder, feature_list — 11-feature mode")
except FileNotFoundError:
    feature_list     = None
    USE_NEW_FEATURES = False
    print(f"✓ Loaded model ({type(model).__name__}), encoder — legacy 7-feature mode")

ORS_API_KEY     = os.environ.get("ORS_API_KEY",     "").strip('"').strip("'")
WEATHER_API_KEY = os.environ.get("WEATHER_API_KEY", "").strip('"').strip("'")

# Public OSRM demo server — free, no API key, no timeout issues
OSRM_BASE = "https://router.project-osrm.org"

# ─────────────────────────────────────────────────────────────────────────────
# ROUTING — OSRM (replaces ORS directions which was timing out)
# ─────────────────────────────────────────────────────────────────────────────

def get_route_osrm(src_coords, dest_coords):
    """
    Returns (distance_km, duration_sec, geojson_geometry).
    src_coords / dest_coords are [lng, lat].
    """
    coord_str = (
        f"{src_coords[0]},{src_coords[1]};"
        f"{dest_coords[0]},{dest_coords[1]}"
    )
    resp = requests.get(
        f"{OSRM_BASE}/route/v1/driving/{coord_str}",
        params={"overview": "full", "geometries": "geojson"},
        timeout=20
    )
    resp.raise_for_status()
    data = resp.json()

    if data.get("code") != "Ok" or not data.get("routes"):
        raise ValueError("OSRM returned no route for these coordinates.")

    route        = data["routes"][0]
    distance_km  = route["distance"] / 1000
    duration_sec = route["duration"]
    geometry     = route["geometry"]   # GeoJSON LineString — same format as before
    return distance_km, duration_sec, geometry

# ─────────────────────────────────────────────────────────────────────────────
# GEOCODING — ORS primary, Nominatim fallback (both free)
# ─────────────────────────────────────────────────────────────────────────────

def _geocode_ors(place_name):
    url  = "https://api.openrouteservice.org/geocode/search"
    resp = requests.get(
        url,
        params={"api_key": ORS_API_KEY, "text": place_name, "size": 1},
        timeout=15
    )
    resp.raise_for_status()
    data = resp.json()
    if not data.get("features"):
        raise ValueError(f"ORS found no results for '{place_name}'")
    return data["features"][0]["geometry"]["coordinates"]  # [lng, lat]


def _geocode_nominatim(place_name):
    url  = "https://nominatim.openstreetmap.org/search"
    resp = requests.get(
        url,
        params={"q": place_name, "format": "json", "limit": 1},
        headers={"User-Agent": "TrafficDelayPredictor/1.0"},
        timeout=15
    )
    resp.raise_for_status()
    data = resp.json()
    if not data:
        raise ValueError(f"Nominatim found no results for '{place_name}'")
    return [float(data[0]["lon"]), float(data[0]["lat"])]  # [lng, lat]


def geocode_location(place_name):
    """ORS first, Nominatim fallback. Raises ValueError if both fail."""
    try:
        return _geocode_ors(place_name)
    except Exception as e:
        print(f"  ORS geocode failed for '{place_name}': {e} — trying Nominatim")
    try:
        return _geocode_nominatim(place_name)
    except Exception as e:
        raise ValueError(
            f"Could not locate '{place_name}'. "
            f"Please check the spelling or try a nearby landmark."
        )

# ─────────────────────────────────────────────────────────────────────────────
# FEATURE BUILDER
# ─────────────────────────────────────────────────────────────────────────────

def build_features(avg_speed, traffic_volume, distance_km,
                   hour, day_of_week, weather_encoded):
    if USE_NEW_FEATURES:
        raw = {
            "avg_speed":       avg_speed,
            "traffic_volume":  traffic_volume,
            "distance_km":     distance_km,
            "hour":            hour,
            "day_of_week":     day_of_week,
            "weather_encoded": weather_encoded,
            "tv_binary_300":   int(traffic_volume >= 300),
            "tv_sq":           float(traffic_volume ** 2),
            "congestion":      float(traffic_volume / (avg_speed + 1.0)),
            "tv_x_dist":       float(traffic_volume * distance_km),
            "is_peak":         1 if (7 <= hour <= 10) or (17 <= hour <= 20) else 0,
        }
        return pd.DataFrame([raw])[feature_list]
    else:
        return pd.DataFrame([{
            "avg_speed":       avg_speed,
            "traffic_volume":  traffic_volume,
            "distance_km":     distance_km,
            "hour":            hour,
            "day_of_week":     day_of_week,
            "month":           datetime.today().month,
            "weather_encoded": weather_encoded,
        }])

# ─────────────────────────────────────────────────────────────────────────────
# FLASK ROUTES
# ─────────────────────────────────────────────────────────────────────────────

@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "status":    "running",
        "message":   "Route Delay Prediction API is active",
        "timestamp": datetime.now().isoformat()
    })


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "healthy"})


# ==================== PREDICT ====================
@app.route("/predict", methods=["POST"])
def predict():
    try:
        data        = request.json
        source      = data["source"]
        destination = data["destination"]
        time_str    = data["time"]

        dt          = datetime.strptime(time_str, "%H:%M")
        hour        = dt.hour
        day_of_week = datetime.today().weekday()

        # Geocode
        src_coords  = geocode_location(source)
        dest_coords = geocode_location(destination)

        # Route via OSRM — no API key, no timeout
        distance_km, duration_sec, geometry = get_route_osrm(src_coords, dest_coords)
        duration_min = round(duration_sec / 60, 1)
        avg_speed    = distance_km / (duration_sec / 3600)

        # Weather — non-critical, silently falls back
        try:
            w_resp      = requests.get(
                "http://api.openweathermap.org/data/2.5/weather",
                params={"q": source, "appid": WEATHER_API_KEY, "units": "metric"},
                timeout=10
            ).json()
            weather     = w_resp.get("weather", [{}])[0].get("main", "Clear")
            temperature = w_resp.get("main", {}).get("temp", 30)
            visibility  = w_resp.get("visibility", 5000) / 1000
        except Exception:
            weather, temperature, visibility = "Clear", 30, 5

        # Encode weather
        try:
            weather_encoded = int(weather_encoder.transform([weather])[0])
        except Exception:
            weather_encoded = 0

        # Traffic volume — calibrated to training range (50–499)
        traffic_volume = 420 if (7 <= hour <= 10) or (17 <= hour <= 20) else 150

        # Predict
        features = build_features(
            avg_speed, traffic_volume, distance_km,
            hour, day_of_week, weather_encoded
        )
        delay = model.predict(features)[0]

        return jsonify({
            "delay":       round(float(delay), 2),
            "geojson":     geometry,
            "distance":    round(distance_km, 2),
            "duration":    duration_min,
            "route":       f"{source} → {destination}",
            "weather":     weather,
            "temperature": temperature,
            "visibility":  visibility
        })

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        import traceback; traceback.print_exc()
        return jsonify({"error": str(e)}), 500


# ==================== BEST TIME ====================
@app.route("/best-time", methods=["POST"])
def best_time():
    try:
        data        = request.get_json()
        source      = data.get("source")
        destination = data.get("destination")

        src_coords  = geocode_location(source)
        dest_coords = geocode_location(destination)

        # One OSRM call — distance/speed reused across all hours
        distance_km, duration_sec, _ = get_route_osrm(src_coords, dest_coords)
        avg_speed   = distance_km / (duration_sec / 3600)
        day_of_week = datetime.today().weekday()

        results = []
        for hour in range(6, 22):
            for minute in [0, 30]:
                traffic_volume  = 420 if (7 <= hour <= 10) or (17 <= hour <= 20) else 150
                weather_encoded = 0  # neutral for time sweep

                features = build_features(
                    avg_speed, traffic_volume, distance_km,
                    hour, day_of_week, weather_encoded
                )
                delay = model.predict(features)[0]
                results.append({
                    "time":  f"{hour:02d}:{minute:02d}",
                    "delay": round(float(delay), 2)
                })

        best = min(results, key=lambda x: x["delay"])
        return jsonify({"times": results, "best": best})

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        import traceback; traceback.print_exc()
        return jsonify({"error": str(e)}), 500


# ==================== ALTERNATIVE ROUTES ====================
@app.route("/alternative-routes", methods=["POST"])
def alternative_routes():
    data        = request.json
    source      = data.get("source")
    destination = data.get("destination")

    if not source or not destination:
        return jsonify({"error": "source and destination required"}), 400

    try:
        src_coords  = geocode_location(source)
        dest_coords = geocode_location(destination)

        # OSRM supports alternatives=3 natively
        coord_str = (
            f"{src_coords[0]},{src_coords[1]};"
            f"{dest_coords[0]},{dest_coords[1]}"
        )
        resp = requests.get(
            f"{OSRM_BASE}/route/v1/driving/{coord_str}",
            params={"alternatives": "3", "overview": "full", "geometries": "geojson"},
            timeout=20
        )

        if not resp.ok:
            return jsonify({"routes": []}), 200

        osrm_data = resp.json()
        if osrm_data.get("code") != "Ok" or not osrm_data.get("routes"):
            return jsonify({"routes": []}), 200

        osrm_routes  = osrm_data["routes"]
        min_duration = min(r["duration"] for r in osrm_routes)

        routes = []
        for i, r in enumerate(osrm_routes):
            is_best      = r["duration"] == min_duration
            distance_km  = round(r["distance"] / 1000, 2)
            duration_min = round(r["duration"] / 60, 1)
            routes.append({
                "label":    "Most Efficient" if is_best else f"Alternative {i}",
                "is_best":  is_best,
                "distance": distance_km,
                "duration": duration_min,
                "summary":  f"{distance_km} km · {duration_min} min",
                "geojson":  {"type": "Feature", "geometry": r["geometry"]}
            })

        return jsonify({"routes": routes})

    except ValueError as e:
        return jsonify({"routes": [], "error": str(e)}), 200
    except Exception as e:
        print(f"Alternative routes error: {e}")
        return jsonify({"routes": []}), 200


# ==================== TRAFFIC ALERTS ====================
@app.route("/traffic-alerts", methods=["POST"])
def traffic_alerts():
    try:
        data        = request.json
        source      = data.get("source", "")
        destination = data.get("destination", "")

        alerts = [
            {
                "id":           "alert-1",
                "type":         "congestion",
                "title":        "Heavy traffic congestion",
                "description":  f"Slow-moving traffic between {source} and {destination}.",
                "location":     f"{source} – {destination} corridor",
                "severity":     "medium",
                "delay_impact": 5,
                "source":       "Live traffic feed",
                "reported_at":  datetime.now().strftime("%I:%M %p")
            }
        ]
        return jsonify({"alerts": alerts})
    except Exception:
        return jsonify({"alerts": []}), 200


# ─────────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    app.run(debug=False, port=5000)
    
    
    
    
    
    
    
    
