import numpy as np
import pandas as pd
from xgboost import XGBRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score
import pickle

# ─── DATA ───
data = {
    'size':     [800,1000,1200,1500,1800,2000,2500,3000,
                 1100,1600,2200,900,1300,1700,2100,2800,
                 950,1450,1900,2300],
    'bedrooms': [1,2,2,3,3,4,4,5,2,3,4,1,2,3,4,5,
                 1,3,3,4],
    'floor':    [5,10,15,3,20,8,12,25,7,18,6,2,9,14,
                 19,22,4,11,16,21],
    'metro_km': [0.5,1.0,0.3,3.0,0.8,2.5,0.2,1.5,
                 0.6,0.4,2.0,4.0,1.2,0.7,0.9,1.1,
                 3.5,0.5,1.8,0.3],
    'city':     [1,0,1,2,1,0,1,1,0,1,2,2,1,0,1,1,
                 2,1,0,1],
    # City: 1=Dubai, 0=Abu Dhabi, 2=Sharjah
    'price':    [900000,1100000,1600000,1400000,2200000,
                 1900000,2800000,3800000,1200000,2000000,
                 2400000,750000,1500000,1950000,2600000,
                 3500000,800000,1700000,2100000,2900000]
}

def train_model():
    df = pd.DataFrame(data)

    X = df[['size','bedrooms','floor','metro_km','city']]
    y = df['price']

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    model = XGBRegressor(
        n_estimators  = 200,
        learning_rate = 0.1,
        max_depth     = 4,
        random_state  = 42
    )

    model.fit(X_train, y_train)

    score = r2_score(y_test, model.predict(X_test))
    print(f"Model R² Score: {score:.2f}")
    print(f"Model trained successfully!")

    # Model save karo
    with open('model.pkl', 'wb') as f:
        pickle.dump(model, f)

    return model

def load_model():
    try:
        with open('model.pkl', 'rb') as f:
            return pickle.load(f)
    except:
        return train_model()

def predict_price(size, bedrooms, floor, metro_km, city):
    model = load_model()

    # City encode karo
    city_map = {'Dubai': 1, 'Abu Dhabi': 0, 'Sharjah': 2}
    city_code = city_map.get(city, 1)

    input_data = pd.DataFrame({
        'size':     [size],
        'bedrooms': [bedrooms],
        'floor':    [floor],
        'metro_km': [metro_km],
        'city':     [city_code]
    })

    price = model.predict(input_data)[0]
    return round(float(price), 0)

# Test karo
if __name__ == "__main__":
    train_model()
    price = predict_price(1400, 3, 12, 0.5, 'Dubai')
    print(f"Test prediction: AED {price:,.0f}")