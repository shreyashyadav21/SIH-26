import re
import os
import glob

# Rename dashboard.html to environment.html
if os.path.exists('dashboard.html'):
    os.rename('dashboard.html', 'environment.html')

html_files = glob.glob('*.html')

for file in html_files:
    try:
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 1. Update all links from dashboard.html to environment.html
        content = re.sub(r'dashboard\.html', 'environment.html', content)
        
        # 2. Add Model Training if missing
        if 'href="training.html"' not in content:
            new_link = '<li><a href="training.html">Model Training</a></li>\n    </ul>'
            content = re.sub(r'</ul>', new_link, content, count=1, flags=re.IGNORECASE)
            
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {file}")
    except Exception as e:
        print(f"Error {file}: {e}")

