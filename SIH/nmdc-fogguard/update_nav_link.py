import glob
import re

html_files = glob.glob('*.html')
for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Update navigation links
    content = re.sub(r'href="fleet\.html"', 'href="radar.html"', content)
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)
print('Updated navigation links to radar.html in all HTML files.')
