import json

transcript_path = r'C:\Users\yadav\.gemini\antigravity\brain\12a68ac6-cbf3-4bf3-80ff-49358cb0ba48\.system_generated\logs\transcript_full.jsonl'

with open(transcript_path, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            data = json.loads(line)
            if 'content' in data and 'Voice Alert Modulation' in data['content']:
                if '<!-- Feature Cards Right -->' in data['content']:
                    with open('recovered_index.html', 'w', encoding='utf-8') as out:
                        out.write(data['content'])
                    print("Found and recovered!")
                    break
        except:
            pass
