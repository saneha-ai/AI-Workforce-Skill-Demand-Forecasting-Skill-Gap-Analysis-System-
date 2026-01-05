
import requests
from bs4 import BeautifulSoup

url = "http://localhost:5173"

try:
    print(f"Fetching {url}...")
    response = requests.get(url)
    print(f"Status Code: {response.status_code}")
    print("Content preview:")
    print(response.text[:500])
    
    soup = BeautifulSoup(response.text, 'html.parser')
    root = soup.find(id='root')
    print(f"\nRoot element empty? {not root.contents if root else 'Root not found'}")
    
    scripts = soup.find_all('script')
    for s in scripts:
        if s.get('src'):
            print(f"Script: {s.get('src')}")
            
except Exception as e:
    print(f"Error: {e}")
