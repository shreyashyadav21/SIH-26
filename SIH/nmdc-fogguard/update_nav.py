import os
import glob
import re

html_files = glob.glob('*.html')
for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Dashboard -> Environment
    content = re.sub(r'>Dashboard<', '>Environment<', content)
    # Fleet Map -> Radar
    content = re.sub(r'>Fleet Map<', '>Radar<', content)
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)
print('Updated navigation text in all HTML files.')
