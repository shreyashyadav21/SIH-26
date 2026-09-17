import re
with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('fleet.html', 'radar.html')
content = content.replace('Fleet Map', 'Radar')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed Radar link in index.html")
