import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler
import pandas as pd
from datetime import datetime, timedelta
import requests
import joblib
from typing import Dict, List, Optional

class WeatherPredictor:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.temp_model = RandomForestRegressor(
            n_estimators=200,
            max_depth=20,
            random_state=42
        )
        self.humidity_model = GradientBoostingRegressor(
            n_estimators=150,
            learning_rate=0.1,
            random_state=42
        )
        self.scaler = StandardScaler()
        
    def _create_features(self, date: datetime) -> np.ndarray:
        """Create time-based features for prediction"""
        return np.array([
            date.month,
            date.day,
            date.hour,
            np.sin(2 * np.pi * date.month / 12),
            np.cos(2 * np.pi * date.month / 12),
            np.sin(2 * np.pi * date.day / 31),
            np.cos(2 * np.pi * date.day / 31),
        ])
    
    def get_historical_data(self, city: str) -> pd.DataFrame:
        """Fetch and generate historical weather data"""
        end_date = datetime.now()
        start_date = end_date - timedelta(days=365)
        dates = pd.date_range(start=start_date, end=end_date, freq='H')
        
      
        base_temp = self._get_base_temperature(city)
        
        data = []
        for date in dates:
           
            season_factor = np.sin(2 * np.pi * (date.month - 1) / 12)
            daily_factor = np.sin(2 * np.pi * (date.hour) / 24)
            
           
            temp = base_temp + \
                   5 * season_factor + \
                   3 * daily_factor + \
                   np.random.normal(0, 1)
            
           
            humidity = 60 - (temp - base_temp) + np.random.normal(0, 5)
            humidity = np.clip(humidity, 30, 90)
            
            features = self._create_features(date)
            data.append({
                'date': date,
                'temperature': temp,
                'humidity': humidity,
                **{f'feature_{i}': v for i, v in enumerate(features)}
            })
            
        return pd.DataFrame(data)
    
    def _get_base_temperature(self, city: str) -> float:
        """Get current temperature as base for historical data generation"""
        try:
            current = self.get_current_weather(city)
            return current['temp']
        except:
            return 25.0 
    
    def train_model(self, city: str) -> float:
        """Train the ML models using historical data"""
        df = self.get_historical_data(city)
        
        feature_cols = [col for col in df.columns if col.startswith('feature_')]
        X = df[feature_cols].values
        y_temp = df['temperature'].values
        y_humidity = df['humidity'].values
        
        
        X_scaled = self.scaler.fit_transform(X)
        
        
        X_train, X_test, y_temp_train, y_temp_test = train_test_split(
            X_scaled, y_temp, test_size=0.2, random_state=42
        )
        _, _, y_humidity_train, y_humidity_test = train_test_split(
            X_scaled, y_humidity, test_size=0.2, random_state=42
        )
        
        
        self.temp_model.fit(X_train, y_temp_train)
        self.humidity_model.fit(X_train, y_humidity_train)
        
        
        joblib.dump(self.temp_model, 'temp_model.joblib')
        joblib.dump(self.humidity_model, 'humidity_model.joblib')
        joblib.dump(self.scaler, 'scaler.joblib')
        
        return self.temp_model.score(X_test, y_temp_test)
    
    def predict_weather(self, city: str, days: int = 180) -> List[Dict]:
        """Predict weather for the next N days"""
        current_weather = self.get_current_weather(city)
        predictions = []
        
        current_date = datetime.now()
        for i in range(days * 24): 
            future_date = current_date + timedelta(hours=i)
            features = self._create_features(future_date)
            features_scaled = self.scaler.transform(features.reshape(1, -1))
            
            temp_pred = self.temp_model.predict(features_scaled)[0]
            humidity_pred = self.humidity_model.predict(features_scaled)[0]
            
            
            event = self._predict_weather_event(temp_pred, humidity_pred)
            
            if i % 24 == 0: 
                predictions.append({
                    'date': future_date.strftime('%Y-%m-%d'),
                    'temperature': round(temp_pred - 3, 1),  
                    'humidity': round(humidity_pred, 1),
                    'event': event
                })
        
        return predictions
    
    def _predict_weather_event(self, temp: float, humidity: float) -> Optional[str]:
        """Predict weather events based on conditions"""
        if temp > 35 and humidity < 30:
            return 'Heat Wave Warning'
        elif humidity > 80:
            return 'Heavy Rainfall Expected'
        elif temp < 15:
            return 'Cold Weather Alert'
        elif humidity < 20:
            return 'Dry Weather Warning'
        elif temp > 30 and humidity > 70:
            return 'High Humidity Warning'
        return None
    
    def get_current_weather(self, city: str) -> Dict:
        """Get current weather data from OpenWeather API"""
        url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={self.api_key}&units=metric"
        response = requests.get(url)
        data = response.json()
        
        return {
            'temp': data['main']['temp'],
            'humidity': data['main']['humidity'],
            'pressure': data['main']['pressure'],
            'wind_speed': data['wind']['speed'],
            'description': data['weather'][0]['description']
        }


if __name__ == "__main__":
    API_KEY = "0cdc6ca18ebacd5d6f81530d813dc335"
    predictor = WeatherPredictor(API_KEY)
    
    
    accuracy = predictor.train_model("Nagpur")
    print(f"Model Accuracy: {accuracy:.2f}")
    
    
    predictions = predictor.predict_weather("Nagpur")
    
    
    import json
    with open('public/predictions.json', 'w') as f:
        json.dump(predictions, f)
    
    print("\nWeather Predictions:")
    for pred in predictions[:7]:  
        print(f"Date: {pred['date']}")
        print(f"Temperature: {pred['temperature']}°C")
        print(f"Humidity: {pred['humidity']}%")
        if pred['event']:
            print(f"Event: {pred['event']}")
        print("---")