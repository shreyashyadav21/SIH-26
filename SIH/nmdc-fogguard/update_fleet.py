import re

with open('fleet.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace inner titles
content = re.sub(r'Fleet Map', 'Radar', content)
content = re.sub(r'FLEET TRACKING', 'RADAR SCANNER', content)
content = re.sub(r'Fleet Status', 'Radar Status', content)

with open('fleet.html', 'w', encoding='utf-8') as f:
    f.write(content)
