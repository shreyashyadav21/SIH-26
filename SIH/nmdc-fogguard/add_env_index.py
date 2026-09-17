import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

if 'href="dashboard.html"' not in content:
    new_link = '<li><a href="dashboard.html">Environment</a></li>\n      '
    content = re.sub(
        r'(<li><a href="video-analysis\.html")', 
        new_link + r'\1', 
        content, 
        flags=re.IGNORECASE
    )
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Added to index.html")
else:
    print("Already in index.html")
