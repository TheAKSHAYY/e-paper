import json

with open('apps/web/public/design-library/manifest.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

manifest = data['items']
print('Total items in manifest:', len(manifest))
implemented = {'des-103', 'des-115', 'des-119', 'des-041', 'des-054', 'des-022', 'des-033', 'des-142', 'des-132', 'des-001'}
unimplemented = [m for m in manifest if m.get('isCanonical', True) and m['id'] not in implemented]
print('Total canonical unimplemented:', len(unimplemented))

by_cat = {}
for m in unimplemented:
    c = m['category']
    by_cat.setdefault(c, []).append(m)

print('\nCounts by category:')
for c, items in by_cat.items():
    print(f'  {c}: {len(items)}')

print('\nFirst 25 canonical unimplemented designs:')
for idx, m in enumerate(unimplemented[:25]):
    print(f"{idx+1:2d}. {m['id']} | {m['category']:<15} | {m['subcategory']:<15} | {m['width']}x{m['height']} | {m['filename']}")

