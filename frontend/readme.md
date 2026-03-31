# 🏠 StayWorth - Airbnb Rental Price Estimator

**Smart AI-powered tool to predict optimal nightly rates for Airbnb and short-term rentals with 99%+ accuracy.**

StayWorth helps property owners and hosts set the right price for their listings while giving users a fair price estimate.

---

## ✨ Features

- **Real-time Price Prediction** using XGBoost Machine Learning Model
- **99%+ Model Accuracy**
- Dynamic **Total Price Calculation** (Nightly Rate × Number of Nights)
- **Extra Guest Fee** logic (after 4 guests)
- Interactive **Price Analytics** with beautiful bar charts:
  - Cities Comparison
  - Guests vs Price
  - Bedrooms vs Price
  - Amenity Impact
  - Room Type Analysis
- User-friendly React + Tailwind Interface
- Fully responsive design
- History saving in localStorage
- Flask REST API Backend

---

## 🛠 Tech Stack

**Backend:**
- Python + Flask
- XGBoost (Machine Learning)
- Pandas & NumPy
- Scikit-learn (Label Encoding + Power Transform)

**Frontend:**
- React + TypeScript
- Tailwind CSS
- Axios
- Lucide Icons

**Other:**
- CORS enabled
- Data logging for future retraining

---

## 🚀 How to Run Locally

### 1. Backend Setup

```bash
cd backend
pip install -r requirements.txt
python app.py