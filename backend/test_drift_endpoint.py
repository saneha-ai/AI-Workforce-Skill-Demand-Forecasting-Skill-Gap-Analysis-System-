
import requests
import json

url = "http://localhost:8006/debug_drift"

# Mock skills that are similar to dataset to test "no drift" (or drift if random)
payload = {
    "skills_batch": [
        ["python", "sql", "machine learning"],
        ["java", "spring boot"],
        ["react", "javascript", "css"]
    ]
}

try:
    print(f"Sending POST request to {url}")
    response = requests.post(url, json=payload)
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        print("Response JSON:")
        print(json.dumps(response.json(), indent=2))
    else:
        print("Error Response:")
        print(response.text)
except Exception as e:
    print(f"Request failed: {e}")
