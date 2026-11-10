areimport json

with open('apps/web/public/design-library/manifest.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

manifest = data['items']
implemented = {'des-103', 'des-115', 'des-119', 'des-041', 'des-054', 'des-022', 'des-033', 'des-142', 'des-132', 'des-001'}
unimplemented = [m for m in manifest if m.get('isCanonical', True) and m['id'] not in implemented]

by_cat = {}
for m in unimplemented:
    c = m['category']
    by_cat.setdefault(c, []).append(m)

for cat, items in by_cat.items():
    print(f'=== Category: {cat} (Total {len(items)}) ===')
    for m in items[:3]:
        print(f"  {m['id']} | sub: {m['subcategory']} | {m['width']}x{m['height']} | {m['filename']}")

