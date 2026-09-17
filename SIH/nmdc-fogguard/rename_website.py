import glob
import re

html_files = glob.glob('*.html')
for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace titles
    content = re.sub(r'NMDC FogGuard', 'MineSafe', content, flags=re.IGNORECASE)
    # Replace brand texts
    content = re.sub(r'NMDC FOGGUARD', 'MINESAFE', content, flags=re.IGNORECASE)
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

print('Updated website name to MineSafe in all files.')
