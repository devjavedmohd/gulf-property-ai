from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from model import predict_price, train_model

# ─── APP BANAO ───
app = FastAPI(
    title="Dubai Property Price Predictor",
    description="Gulf Real Estate AI — Powered by XGBoost",
    version="1.0.0"
)

# ─── CORS ───
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── INPUT FORMAT ───
class PropertyInput(BaseModel):
    size:      float
    bedrooms:  int
    floor:     int
    metro_km:  float
    city:      str

# ─── ROUTES ───
@app.get("/")
def home():
    return {
        "message": "Property Price Predictor API",
        "status":  "running"
    }

@app.post("/predict")
def predict(property: PropertyInput):
    price = predict_price(
        size     = property.size,
        bedrooms = property.bedrooms,
        floor    = property.floor,
        metro_km = property.metro_km,
        city     = property.city
    )

    return {
        "city":            property.city,
        "size":            property.size,
        "bedrooms":        property.bedrooms,
        "floor":           property.floor,
        "metro_km":        property.metro_km,
        "predicted_price": price,
        "currency":        "AED",
        "formatted":       f"AED {price:,.0f}"
    }

@app.get("/train")
def train():
    train_model()
    return {"message": "Model trained successfully!"}