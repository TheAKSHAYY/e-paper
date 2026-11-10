import json

with open('apps/web/public/design-library/manifest.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

manifest = data['items']
implemented = {'des-103', 'des-115', 'des-119', 'des-041', 'des-054', 'des-022', 'des-033', 'des-142', 'des-132', 'des-001'}
unimplemented = [m for m in manifest if m.get('isCanonical', True) and m['id'] not in implemented]

batch1_ids = [
    'des-002', # ads
    'des-010', # calendar
    'des-012', # columns (12col)
    'des-019', # columns (2col)
    'des-090', # footers
    'des-097', # headers
    'des-130', # rashifal
    'des-134', # start-decor
    'des-140', # subheaders
    'des-003', # ads (2nd diverse commercial layout)
]

batch1_items = [m for m in manifest if m['id'] in batch1_ids]
print('Selected 10 designs for Batch 1:')
for idx, m in enumerate(batch1_items):
    print(f"{idx+1:2d}. ID: {m['id']} | Category: {m['category']:<12} | Sub: {m['subcategory']:<12} | Dims: {m['width']}x{m['height']} | File: {m['filename']}")

