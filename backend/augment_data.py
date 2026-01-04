import pandas as pd
import random
import os

# Configuration
DATASET_PATH = "c:/Users/vinit/OneDrive/Desktop/career_match12/dataset.csv"
OUTPUT_PATH = "c:/Users/vinit/OneDrive/Desktop/career_match12/dataset.csv"

# Bangalore Coordinates
BASE_LAT = 12.9716
BASE_LON = 77.5946

COMPANIES = ["Infosys", "TCS", "Wipro", "Accenture", "Google", "Microsoft", "Amazon", "Flipkart", "Swiggy", "Zomato", "Goldman Sachs", "JP Morgan"]

def augment_data():
    if not os.path.exists(DATASET_PATH):
        print(f"File not found: {DATASET_PATH}")
        return

    df = pd.read_csv(DATASET_PATH)
    
    # Add Company if missing
    if 'company' not in df.columns:
        df['company'] = [random.choice(COMPANIES) for _ in range(len(df))]
        
    # Add Lat/Lon if missing
    if 'latitude' not in df.columns:
        # Generate random points within ~20km radius (approx)
        # 1 deg lat ~ 111km. 0.1 deg ~ 11km. 0.2 ~ 22km.
        df['latitude'] = [BASE_LAT + random.uniform(-0.2, 0.2) for _ in range(len(df))]
        df['longitude'] = [BASE_LON + random.uniform(-0.2, 0.2) for _ in range(len(df))]

    # Add Apply Link if missing
    if 'apply_link' not in df.columns:
        df['apply_link'] = ["https://linkedin.com/jobs/"] * len(df)
        
    df.to_csv(OUTPUT_PATH, index=False)
    print(f"Dataset augmented and saved to {OUTPUT_PATH}")
    print(df[['job_role', 'company', 'latitude', 'longitude']].head())

if __name__ == "__main__":
    augment_data()
