const page = document.getElementById('page');
const languageSelect = document.getElementById('languageSelect');
const gridSelect = document.getElementById('gridSelect');
const gutterInput = document.getElementById('gutterInput');
const exportBtn = document.getElementById('exportBtn');

const seedContent = {
  english: {
    leadTitle: 'Lead Story',
    leadBody: 'A multilingual publishing desk for Indian newspaper and e-paper production.',
  },
  hindi: {
    leadTitle: 'मुख्य समाचार शीर्षक',
    leadBody: 'यह एक भारतीय बहुभाषी समाचार पत्र डिज़ाइन स्टूडियो है, जो प्रिंट और ई-पेपर लेआउट तैयार करने में मदद करता है।',
  },
  bengali: {
    leadTitle: 'প্রধান সংবাদ শিরোনাম',
    leadBody: 'এটি একটি বহুভাষিক ভারতীয় সংবাদপত্র ও ই-পেপার প্রকাশনা স্টুডিও।',
  },
  tamil: {
    leadTitle: 'முக்கிய செய்தி தலைப்பு',
    leadBody: 'இது இந்திய பன்மொழி செய்தித்தாள் மற்றும் இ-பேப்பர் வெளியீட்டு ஸ்டுடியோ.',
  },
  urdu: {
    leadTitle: 'اہم خبر کی سرخی',
    leadBody: 'یہ بھارتی کثیر لسانی اخبار اور ای پیپر پبلشنگ اسٹوڈیو ہے۔',
  },
};

function setLanguage(language) {
  page.classList.remove('page-hindi', 'page-english', 'page-bengali', 'page-tamil', 'page-urdu');
  page.classList.add(`page-${language}`);

  const leadTitle = page.querySelector('.story h2');
  const leadBody = page.querySelector('.story p');
  const next = seedContent[language];
  if (next && leadTitle && leadBody && !leadTitle.dataset.edited) {
    leadTitle.textContent = next.leadTitle;
    leadBody.textContent = next.leadBody;
  }
}

function setGrid(columns) {
  page.style.gridTemplateColumns = `repeat(${columns}, minmax(0, 1fr))`;
}

function setGutter(value) {
  page.style.gap = `${value}px`;
}

function markEdited(event) {
  event.target.dataset.edited = 'true';
}

function exportVectorPdf() {
  const rect = page.getBoundingClientRect();
  const stories = Array.from(page.querySelectorAll('.story'));
  const pageRect = page.getBoundingClientRect();

  const blocks = stories
    .map((story) => {
      const storyRect = story.getBoundingClientRect();
      const left = storyRect.left - pageRect.left;
      const top = storyRect.top - pageRect.top;
      const width = storyRect.width;
      const height = storyRect.height;
      const h2 = story.querySelector('h2')?.textContent ?? '';
      const p = story.querySelector('p')?.textContent ?? '';

      return `
        <g>
          <rect x="${left}" y="${top}" width="${width}" height="${height}" fill="white" stroke="#cccccc"/>
          <text x="${left + 12}" y="${top + 28}" font-size="18" fill="#8e1b12">${escapeXml(h2)}</text>
          <text x="${left + 12}" y="${top + 56}" font-size="14" fill="#111111">${escapeXml(p)}</text>
        </g>`;
    })
    .join('');

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${rect.width}" height="${rect.height}" viewBox="0 0 ${rect.width} ${rect.height}">
      <rect width="100%" height="100%" fill="white" />
      ${blocks}
    </svg>`;

  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Vector PDF Export</title></head><body style="margin:0">${svg}<script>window.onload=function(){window.print();};<\/script></body></html>`;
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank', 'noopener,noreferrer');
}

function escapeXml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

page.querySelectorAll('[contenteditable="true"]').forEach((node) => {
  node.addEventListener('input', markEdited);
});

languageSelect.addEventListener('change', (event) => setLanguage(event.target.value));
gridSelect.addEventListener('change', (event) => setGrid(event.target.value));
gutterInput.addEventListener('input', (event) => setGutter(event.target.value));
exportBtn.addEventListener('click', exportVectorPdf);

setGrid(gridSelect.value);
setGutter(gutterInput.value);
setLanguage(languageSelect.value);
