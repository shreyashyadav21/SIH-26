import re

html_files = ['index.html', 'video-analysis.html', 'radar.html']

for file in html_files:
    try:
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Insert Environment link before Video AI link
        # We look for something like <li><a href="video-analysis.html"
        new_link = '<li><a href="dashboard.html">Environment</a></li>\n      '
        
        # Avoid double inserting if it already exists
        if 'href="dashboard.html"' not in content:
            content = re.sub(
                r'(<li><a href="video-analysis\.html")', 
                new_link + r'\1', 
                content, 
                flags=re.IGNORECASE
            )
            
            with open(file, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Added Environment back to {file}")
        else:
            print(f"Environment already in {file}")
            
    except Exception as e:
        print(f"Error processing {file}: {e}")

