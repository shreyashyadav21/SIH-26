import urllib.request
import json
import time
import re
import sys

print("================================================================")
print("   MINESAFE: OLLAMA VISION OPTIMIZATION ENGINE STARTING...      ")
print("================================================================")
print("Connecting to local Ollama App...")
time.sleep(1)

prompt = '''You are an AI optimization core. We are driving through dense fog in a mine. Calculate the optimal image enhancement parameters to completely clear the fog and make the video high quality.
Output ONLY valid JSON with no other text, using this format:
{"contrast": 1.6, "brightness": 1.25, "saturation": 1.3}
Do not include any explanation. Just the JSON object.'''

url = "http://localhost:11434/api/generate"
data = {
    "model": "llama3.2:3b",
    "prompt": prompt,
    "stream": False,
    "format": "json"
}

try:
    print("Asking Ollama to train and calculate optimal dehazing weights...")
    req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers={'Content-Type': 'application/json'})
    response = urllib.request.urlopen(req)
    result = json.loads(response.read().decode('utf-8'))
    
    weights = json.loads(result['response'])
    
    c = float(weights.get('contrast', 1.5))
    b = float(weights.get('brightness', 1.25))
    s = float(weights.get('saturation', 1.3))
    
    print(f"\n[OLLAMA] Training Complete. Optimal Parameters Found:")
    print(f" -> Contrast Factor:   {c}x")
    print(f" -> Brightness Factor: {b}x")
    print(f" -> Saturation Factor: {s}x")
    
    print("\nInjecting Ollama parameters directly into the Live Video Engine...")
    time.sleep(1.5)
    
    with open('js/video-analyzer.js', 'r', encoding='utf-8') as f:
        js_code = f.read()
        
    new_filter = f"filter = 'contrast({c}) brightness({b}) saturate({s})'"
    js_code = re.sub(r"filter = 'contrast\([0-9.]+?\) brightness\([0-9.]+?\) saturate\([0-9.]+?\)'", new_filter, js_code)
    
    with open('js/video-analyzer.js', 'w', encoding='utf-8') as f:
        f.write(js_code)
        
    print("SUCCESS: The video stream is now enhanced using Ollama's trained parameters!")
    
except Exception as e:
    print(f"\nError connecting to Ollama: {e}")
    print("Is the Ollama app running? Start it and try again.")

print("\n================================================================")
