import re
import glob

# 1. Restore index.html from recovered_index.html, stripping line numbers
with open('recovered_index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

clean_lines = []
start_parsing = False
for line in lines:
    if line.startswith('1: <!DOCTYPE html>'):
        start_parsing = True
    if start_parsing:
        # Strip the "123: " prefix
        clean_line = re.sub(r'^[0-9]+:\s', '', line)
        clean_lines.append(clean_line)

index_content = "".join(clean_lines)

# Apply rebranding to MineSafe in the recovered index
index_content = re.sub(r'NMDC FogGuard', 'MineSafe', index_content, flags=re.IGNORECASE)
index_content = re.sub(r'NMDC FOGGUARD', 'MINESAFE', index_content, flags=re.IGNORECASE)
index_content = re.sub(r'NMDC MinesFE', 'MineSafe', index_content, flags=re.IGNORECASE)
index_content = re.sub(r'MinesFE', 'MineSafe', index_content, flags=re.IGNORECASE)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(index_content)

print("Restored original index.html")

# 2. Update navigation menus in ALL html files to only include Home, Video AI, and Radar
html_files = ['index.html', 'video-analysis.html', 'radar.html']

for file in html_files:
    try:
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Remove Dashboard
        content = re.sub(r'<li><a href="dashboard\.html".*?</li>', '', content, flags=re.IGNORECASE|re.DOTALL)
        # Remove Training
        content = re.sub(r'<li><a href="training\.html".*?</li>', '', content, flags=re.IGNORECASE|re.DOTALL)
        # Remove Fleet (it was already renamed to Radar in radar.html, but let's be careful)
        
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Cleaned navigation in {file}")
    except Exception as e:
        print(f"Could not clean {file}: {e}")

