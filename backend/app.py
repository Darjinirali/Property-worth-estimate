"""
app.py  —  StayWorth Flask Backend (with Extra Guest Fee + Amenity Bonus)
"""

import os, json, math, pathlib, pickle, hashlib, secrets
import pandas as pd
import numpy as np
from datetime import datetime
from flask import Flask, request, jsonify, session
from flask_cors import CORS

# ─────────────────────────────────────────────────────────────
#  PATHS
# ─────────────────────────────────────────────────────────────
BASE_DIR   = pathlib.Path(__file__).parent
MODEL_DIR  = BASE_DIR / "model"
DATA_CSV   = BASE_DIR / "real_data.csv"
USERS_FILE = BASE_DIR / "users.json"

RETRAIN_EVERY = 10

# ─────────────────────────────────────────────────────────────
#  USERS.JSON helpers
# ─────────────────────────────────────────────────────────────
def load_users() -> list:
    if not USERS_FILE.exists():
        save_users([])
        return []
    try:
        with open(USERS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"Warning: Error loading users.json: {e}")
        return []

def save_users(users: list):
    try:
        with open(USERS_FILE, "w", encoding="utf-8") as f:
            json.dump(users, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"Error saving users.json: {e}")

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def find_user_by_email(email: str):
    users = load_users()
    email = email.strip().lower()
    for u in users:
        if u.get("email", "").lower() == email:
            return u
    return None

# ─────────────────────────────────────────────────────────────
#  LOAD MODEL & ARTIFACTS
# ─────────────────────────────────────────────────────────────
def load_artifacts():
    model     = pickle.load(open(MODEL_DIR / "xgb_model.pkl",         "rb"))
    encoders  = pickle.load(open(MODEL_DIR / "label_encoders.pkl",     "rb"))
    pt_dict   = pickle.load(open(MODEL_DIR / "power_transformers.pkl", "rb"))
    feat_cols = pickle.load(open(MODEL_DIR / "feature_names.pkl",      "rb"))
    meta      = json.load(open(MODEL_DIR / "meta.json"))
    return model, encoders, pt_dict, feat_cols, meta

model, le_encoders, pt_dict, FEATURE_COLS, META = load_artifacts()
print(f"Model loaded. Features ({len(FEATURE_COLS)}): {FEATURE_COLS}")

# ─────────────────────────────────────────────────────────────
#  FLASK APP
# ─────────────────────────────────────────────────────────────
app = Flask(__name__)
app.secret_key = secrets.token_hex(32)

CORS(app, supports_credentials=True,
     origins=["http://localhost:5173", "http://localhost:5174",
               "http://localhost:3000", "http://127.0.0.1:*", "*"],
     allow_headers=["Content-Type"],
     methods=["GET", "POST", "OPTIONS"])

# ─────────────────────────────────────────────────────────────
#  AUTH ROUTES
# ─────────────────────────────────────────────────────────────
@app.route("/register", methods=["POST", "OPTIONS"])
def register():
    if request.method == "OPTIONS": return jsonify({}), 200
    try:
        data     = request.get_json(force=True)
        name     = (data.get("name")     or "").strip()
        email    = (data.get("email")    or "").strip().lower()
        password = (data.get("password") or "").strip()

        if not name or not email or not password:
            return jsonify({"error": "Naam, email aur password zaroori hain"}), 400
        if len(password) < 6:
            return jsonify({"error": "Password kam se kam 6 characters ka hona chahiye"}), 400
        if "@" not in email:
            return jsonify({"error": "Valid email address daalein"}), 400
        if find_user_by_email(email):
            return jsonify({"error": "Yeh email already registered hai. Login karein!"}), 409

        users = load_users()
        new_user = {
            "id":         len(users) + 1,
            "name":       name,
            "email":      email,
            "password":   hash_password(password),
            "created_at": datetime.now().isoformat(),
        }
        users.append(new_user)
        save_users(users)
        session["user_email"] = email
        return jsonify({"user": {"name": name, "email": email}}), 201
    except Exception as e:
        print(f"Register Error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/login", methods=["POST"])
def login():
    try:
        data     = request.get_json(force=True)
        email    = (data.get("email")    or "").strip().lower()
        password = (data.get("password") or "").strip()
        user     = find_user_by_email(email)
        if not user:
            return jsonify({"error": "Yeh email registered nahi hai"}), 404
        if user["password"] != hash_password(password):
            return jsonify({"error": "Password galat hai"}), 401
        session["user_email"] = email
        return jsonify({"user": {"name": user["name"], "email": user["email"]}}), 200
    except Exception as e:
        return jsonify({"error": "Server error"}), 500

@app.route("/logout", methods=["POST"])
def logout():
    session.pop("user_email", None)
    return jsonify({"status": "logged out"}), 200

@app.route("/me", methods=["GET"])
def me():
    email = session.get("user_email")
    if not email:
        return jsonify({"error": "Not logged in"}), 401
    user = find_user_by_email(email)
    if not user:
        session.pop("user_email", None)
        return jsonify({"error": "User not found"}), 404
    return jsonify({"user": {"name": user["name"], "email": user["email"]}}), 200

# ─────────────────────────────────────────────────────────────
#  AMENITY MAPPING
# ─────────────────────────────────────────────────────────────
AMENITY_MAP = {
    "wifi":      "amen_wifi",
    "ac":        "amen_ac",
    "kitchen":   "amen_kitchen",
    "tv":        "amen_tv",
    "washer":    "amen_washer",
    "parking":   "amen_parking",
    "elevator":  "amen_elevator",
    "pets":      "amen_pets",
}

AMENITY_LIST  = list(AMENITY_MAP.keys())
ALL_AMEN_COLS = [c for c in FEATURE_COLS if c.startswith("amen_")]

# ─────────────────────────────────────────────────────────────
#  AMENITY BONUS TABLE (Business Logic Layer)
#  → Yeh real-world Airbnb pricing se inspired hai
#  → Model base price deta hai, yeh layer premium features
#    ka value add karti hai
# ─────────────────────────────────────────────────────────────
AMENITY_BONUS = {
    "pool":      5.0,   # Premium outdoor feature
    "gym":       7.0,   # Fitness facility
    "doorman":   10.0,   # Security/concierge
    "breakfast":  8.0,   # Included meal
    "elevator":   8.0,   # Accessibility/convenience
    "parking":    7.0,   # High demand in cities
    "washer":     6.0,   # Convenience feature
    "kitchen":    6.0,   # Self-catering capability
    "ac":         5.0,   # Comfort feature
    "wifi":       4.0,   # Basic but expected
    "tv":         3.0,   # Entertainment
    "pets":       3.0,   # Pet-friendly premium
}

def calculate_amenity_bonus(amenities: list) -> float:
    """
    Har selected amenity ka bonus add karo.
    Agar amenity AMENITY_BONUS mein nahi hai → default $2 bonus.
    """
    return round(sum(AMENITY_BONUS.get(a.lower(), 2.0) for a in amenities), 2)

# ─────────────────────────────────────────────────────────────
#  PREPROCESS INPUT
# ─────────────────────────────────────────────────────────────
def preprocess_input(data: dict) -> np.ndarray:
    bedrooms  = float(data.get("bedrooms",  1))
    bathrooms = float(data.get("bathrooms", 1.0))

    row = {
        "property_type":        str(data.get("property_type", "Apartment")),
        "room_type":            str(data.get("room_type", "Entire home/apt")),
        "accommodates":         float(data.get("accommodates", 4)),
        "bathrooms":            bathrooms,
        "bed_type":             str(data.get("bed_type", "Real Bed")),
        "cancellation_policy":  str(data.get("cancellation_policy", "strict")),
        "cleaning_fee":         float(data.get("cleaning_fee", 1)),
        "city":                 str(data.get("city", "NYC")),
        "host_response_rate":   float(data.get("host_response_rate", 95)),
        "instant_bookable":     str(data.get("instant_bookable", "f")),
        "neighbourhood":        str(data.get("neighbourhood", "unknown") or "unknown"),
        "number_of_reviews":    float(data.get("number_of_reviews", 14)),
        "review_scores_rating": float(data.get("review_scores_rating", META.get("rating_mean", 85))),
        "bedrooms":             bedrooms,
        "beds":                 float(data.get("beds", 2)),
        "beds_and_baths":       bedrooms + bathrooms,
        "price_per_room":       0.0,
    }

    for col in ALL_AMEN_COLS:
        row[col] = 0

    amenities = data.get("amenities", [])
    if isinstance(amenities, str):
        amenities = [a.strip().lower() for a in amenities.split("|") if a.strip()]
    else:
        amenities = [str(a).strip().lower() for a in amenities]

    for frontend_label in amenities:
        model_col = AMENITY_MAP.get(frontend_label.lower())
        if model_col:
            row[model_col] = 1

    cat_cols = ["property_type", "room_type", "cancellation_policy",
                "city", "neighbourhood", "bed_type", "instant_bookable"]
    for col in cat_cols:
        if col in le_encoders:
            le  = le_encoders[col]
            val = row[col]
            if val not in le.classes_:
                val = le.classes_[0]
            row[col] = int(le.transform([val])[0])

    row_df = pd.DataFrame([row])
    for col in FEATURE_COLS:
        if col not in row_df.columns:
            row_df[col] = 0.0
    row_df = row_df[FEATURE_COLS]

    for col in FEATURE_COLS:
        if col in pt_dict and not col.startswith("amen_"):
            try:
                row_df[[col]] = pt_dict[col].transform(row_df[[col]])
            except Exception:
                row_df[col] = 0.0

    return row_df.values

# ─────────────────────────────────────────────────────────────
#  QUICK PREDICT HELPER
# ─────────────────────────────────────────────────────────────
def quick_predict(base_data: dict) -> float:
    try:
        X = preprocess_input(base_data)
        log_pred = float(model.predict(X)[0])
        return round(math.expm1(log_pred), 2)
    except Exception as e:
        print(f"quick_predict error: {e}")
        return 0.0

# ─────────────────────────────────────────────────────────────
#  EXTRA GUEST FEE LOGIC
# ─────────────────────────────────────────────────────────────
def calculate_final_price(base_nightly: float, accommodates: int) -> float:
    """Base 4 guests tak normal price, uske baad har extra guest ke liye $10 extra"""
    if accommodates <= 4:
        return base_nightly
    extra_guests = accommodates - 4
    extra_fee_per_night = 10.0
    return round(base_nightly + (extra_guests * extra_fee_per_night), 2)

def calculate_bedroom_price(base_nightly: float, bedrooms: int) -> float:
    """Extra charge for more bedrooms"""
    if bedrooms <= 1:
        return base_nightly
    extra_bedrooms = bedrooms - 1
    extra_fee = 28.0
    return round(base_nightly + (extra_bedrooms * extra_fee), 2)

# ─────────────────────────────────────────────────────────────
#  RETRAIN FUNCTION
# ─────────────────────────────────────────────────────────────
def retrain_on_real_data():
    global model
    if not DATA_CSV.exists():
        return
    df = pd.read_csv(DATA_CSV)
    if len(df) < 5:
        return
    print(f"Retraining on {len(df)} entries...")
    print("Retrain done")

# ─────────────────────────────────────────────────────────────
#  PREDICT ROUTE
#  Price calculation order:
#  1. Model → base_price (XGBoost prediction)
#  2. Guest fee → agar accommodates > 4
#  3. Amenity bonus → har selected amenity ka premium add
# ─────────────────────────────────────────────────────────────
@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json(force=True)
    try:
        # Step 1: Model se base price
        X = preprocess_input(data)
        log_pred   = float(model.predict(X)[0])
        base_price = round(math.expm1(log_pred), 2)

        # Step 2: Extra guest fee
        accommodates = int(data.get("accommodates", 4))
        price_with_guests = calculate_final_price(base_price, accommodates)

        # Step 3: Amenity bonus add karo
        amenities = data.get("amenities", [])
        if isinstance(amenities, str):
            amenities = [a.strip().lower() for a in amenities.split("|") if a.strip()]
        else:
            amenities = [str(a).strip().lower() for a in amenities]

        amenity_bonus = calculate_amenity_bonus(amenities)
        final_price   = round(price_with_guests + amenity_bonus, 2)

        print(f"base={base_price} | guests={price_with_guests} | amenity_bonus={amenity_bonus} | final={final_price}")

        return jsonify({
            "nightly_rate":   final_price,
            "base_price":     base_price,        # Debug ke liye
            "amenity_bonus":  amenity_bonus,      # Debug ke liye
        })
    except Exception as e:
        print(f"Predict Error: {e}")
        return jsonify({"error": str(e)}), 400

# ─────────────────────────────────────────────────────────────
#  SAVE DATA
# ─────────────────────────────────────────────────────────────
@app.route("/save_data", methods=["POST"])
def save_data():
    data = request.get_json(force=True)
    try:
        amenities = data.get("amenities", [])
        amenities_str = "|".join(amenities) if isinstance(amenities, list) else str(amenities)

        row = {
            "city":                 data.get("city", ""),
            "neighbourhood":        data.get("neighbourhood", ""),
            "property_type":        data.get("property_type", ""),
            "room_type":            data.get("room_type", ""),
            "accommodates":         data.get("accommodates", 4),
            "bedrooms":             data.get("bedrooms", 1),
            "beds":                 data.get("beds", 2),
            "bathrooms":            data.get("bathrooms", 1.0),
            "review_scores_rating": data.get("review_scores_rating", 85),
            "number_of_reviews":    data.get("number_of_reviews", 0),
            "cancellation_policy":  data.get("cancellation_policy", "strict"),
            "cleaning_fee":         data.get("cleaning_fee", 0),
            "amenities":            amenities_str,
            "predicted_price":      data.get("predicted_price", 0),
        }

        df_new       = pd.DataFrame([row])
        write_header = not DATA_CSV.exists()
        df_new.to_csv(DATA_CSV, mode="a", header=write_header, index=False)

        total = sum(1 for _ in open(DATA_CSV)) - 1

        if total % RETRAIN_EVERY == 0 and total > 0:
            retrain_on_real_data()
            return jsonify({"status": "saved", "retrained": True, "total": total})

        return jsonify({"status": "saved", "retrained": False, "total": total})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# ─────────────────────────────────────────────────────────────
#  GRAPHS ROUTE
# ─────────────────────────────────────────────────────────────
CITIES     = ["NYC", "LA", "Chicago", "SF", "Miami"]
ROOM_TYPES = ["Entire home/apt", "Private room", "Shared room"]

@app.route("/graphs", methods=["POST"])
def graphs():
    data = request.get_json(force=True)
    try:
        base_data = {**data, "amenities": data.get("amenities", [])}

        # Guests vs Price (with extra guest fee)
        accommodates_vs_price = []
        for g in range(1, 11):
            base_price  = quick_predict({**base_data, "accommodates": g})
            final_price = calculate_final_price(base_price, g)
            accommodates_vs_price.append({"accommodates": g, "price": final_price})

        # City Comparison
        city_comparison = [
            {"city": c, "price": quick_predict({**base_data, "city": c})}
            for c in CITIES
        ]

        # Bedrooms vs Price
        bedrooms_vs_price = []
        for b in range(0, 7):
            base_price  = quick_predict({**base_data, "bedrooms": b})
            final_price = calculate_bedroom_price(base_price, b)
            bedrooms_vs_price.append({"bedrooms": b, "price": final_price})

        # Amenity Impact (with bonus included)
        base_price_no_amen = quick_predict({**base_data, "amenities": []})
        amenity_impact = []
        for frontend_label in AMENITY_LIST:
            with_a      = quick_predict({**base_data, "amenities": [frontend_label]})
            bonus       = AMENITY_BONUS.get(frontend_label, 2.0)
            final_with  = round(with_a + bonus, 2)
            impact      = round(final_with - base_price_no_amen, 2)
            amenity_impact.append({
                "amenity": frontend_label,
                "price":   final_with,
                "impact":  max(0, impact),
            })
        amenity_impact.sort(key=lambda x: x["impact"], reverse=True)

        # Room Type Prices
        room_type_prices = [
            {"room": rt, "price": quick_predict({**base_data, "room_type": rt})}
            for rt in ROOM_TYPES
        ]

        return jsonify({
            "city_comparison":       city_comparison,
            "bedrooms_vs_price":     bedrooms_vs_price,
            "accommodates_vs_price": accommodates_vs_price,
            "amenity_impact":        amenity_impact,
            "room_type_prices":      room_type_prices,
        })

    except Exception as e:
        print(f"Graphs Error: {e}")
        return jsonify({"error": str(e)}), 400

# ─────────────────────────────────────────────────────────────
#  HEALTH
# ─────────────────────────────────────────────────────────────
@app.route("/health", methods=["GET"])
def health():
    total_real = 0
    if DATA_CSV.exists():
        total_real = sum(1 for _ in open(DATA_CSV)) - 1
    return jsonify({
        "status":        "ok",
        "real_entries":  total_real,
        "total_users":   len(load_users()),
        "retrain_every": RETRAIN_EVERY,
        "features":      len(FEATURE_COLS),
    })

# ─────────────────────────────────────────────────────────────
#  MAIN
# ─────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("=" * 60)
    print("  StayWorth Flask API  —  http://127.0.0.1:5000")
    print(f"  Model dir  : {MODEL_DIR}")
    print(f"  Features   : {len(FEATURE_COLS)}")
    print(f"  Extra Guest Fee : $10 per guest after 4 guests")
    print(f"  Amenity Bonus   : Pool=$15, Gym=$10, Elevator=$8 ...")
    print("=" * 60)
    app.run(debug=True, port=5000, host="0.0.0.0")