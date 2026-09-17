import re

html_files = ['index.html']

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if '>Environment</a>' not in content:
        new_link = '<li><a href="dashboard.html">Environment</a></li>\n      '
        content = re.sub(
            r'(<li><a href="video-analysis\.html")', 
            new_link + r'\1', 
            content, 
            flags=re.IGNORECASE
        )
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Fixed index.html")
