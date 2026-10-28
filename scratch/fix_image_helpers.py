with open('packages/template-engine/src/index.ts', 'r', encoding='utf-8') as f:
    c = f.read()

target = """          let imageHtml = '';
          if (hasImage) {
            imageHtml = `
              <figure class="article-figure placement-${art.imagePlacement} layout-${art.imageLayout ?? 'full'} aspect-${art.imageAspect ?? 'standard'}">
                <img src="${escapeHtml(art.imageUrl ?? '')}" alt="${escapeHtml(art.imageCaption ?? art.headline ?? '')}" class="article-image aspect-${art.imageAspect ?? 'standard'}" style="object-fit: ${art.imageFit ?? 'cover'}; object-position: ${art.imageFocalPoint ?? 'center'};" onerror="this.style.display='none'" />"""

replacement = """          let imageHtml = '';
          if (hasImage) {
            const objectPos = getImageObjectPosition(art);
            const aspectStyle = getImageAspectRatio(art.imageAspect);
            const fit = art.imageFit ?? 'cover';
            imageHtml = `
              <figure class="article-figure placement-${art.imagePlacement} layout-${art.imageLayout ?? 'full'} aspect-${art.imageAspect ?? 'standard'}">
                <img src="${escapeHtml(art.imageUrl ?? '')}" alt="${escapeHtml(art.imageCaption ?? art.headline ?? '')}" class="article-image aspect-${art.imageAspect ?? 'standard'}" style="object-fit: ${fit}; object-position: ${objectPos}; aspect-ratio: ${aspectStyle};" onerror="this.style.display='none'" />"""

if target in c:
    c = c.replace(target, replacement, 1)
    with open('packages/template-engine/src/index.ts', 'w', encoding='utf-8') as f:
        f.write(c)
    print('Successfully applied image helper usage!')
else:
    print('Target not found!')
