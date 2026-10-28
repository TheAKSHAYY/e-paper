import re, sys
sys.stdout.reconfigure(encoding='utf-8')

# Table mapping all 10 Devanagari digits to English digits
DEV_TO_ENG = str.maketrans('०१२३४५६७८९', '0123456789')
dev_digit_re = re.compile(r'[\u0966-\u096F]')

def replace_in_file(filepath, replacements=None):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content
    if replacements:
        for old, new in replacements:
            if old in content:
                content = content.replace(old, new)
                print(f"[{filepath}] Replaced: {repr(old)} -> {repr(new)}")
            else:
                print(f"[{filepath}] WARNING: Target not found: {repr(old)}")

    # Check if there are still any devanagari numerals
    matches = dev_digit_re.findall(content)
    if matches:
        print(f"[{filepath}] Remaining Devanagari digits: {matches}")
        # Automatically translate remaining devanagari digits
        content = content.translate(DEV_TO_ENG)
        print(f"[{filepath}] Applied translate for remaining digits.")

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"[{filepath}] Finished. Changed: {content != original}")

# 1. apps/renderer/src/index.test.ts
replace_in_file('apps/renderer/src/index.test.ts', [
    ('स्थापना १९४७', 'स्थापना 1947'),
    ('मंगलवार, २७ अक्टूबर २०२६', 'मंगलवार, 27 अक्टूबर 2026'),
    ('६८ देशों ने दी स्वीकृति', '68 देशों ने दी स्वीकृति')
])

# 2. apps/web/src/components/ArticleEditorForm.tsx
replace_in_file('apps/web/src/components/ArticleEditorForm.tsx', [
    ('अधिकतम सीमा ५ MB', 'अधिकतम सीमा 5 MB')
])

# 3. apps/web/src/components/EditorToolbar.tsx
replace_in_file('apps/web/src/components/EditorToolbar.tsx', [
    ("label: '१. चुनें'", "label: '1. चुनें'"),
    ("label: '२. लिखें'", "label: '2. लिखें'"),
    ("label: '३. सजाएँ'", "label: '3. सजाएँ'"),
    ("label: '४. डाउनलोड करें'", "label: '4. डाउनलोड करें'"),
    ("<option value={0.5}>५०%</option>", "<option value={0.5}>50%</option>"),
    ("<option value={0.75}>७५%</option>", "<option value={0.75}>75%</option>"),
    ("<option value={1.0}>१००%</option>", "<option value={1.0}>100%</option>"),
    ("<option value={1.25}>१२५%</option>", "<option value={1.25}>125%</option>")
])

# 4. apps/web/src/components/FirstUseGuideModal.tsx
replace_in_file('apps/web/src/components/FirstUseGuideModal.tsx', [
    ('४ आसान चरणों में', '4 आसान चरणों में'),
    ('<span className="w-8 h-8 rounded-full bg-stone-900 text-stone-100 flex items-center justify-center font-bold text-sm shrink-0">१</span>',
     '<span className="w-8 h-8 rounded-full bg-stone-900 text-stone-100 flex items-center justify-center font-bold text-sm shrink-0">1</span>'),
    ('<span className="w-8 h-8 rounded-full bg-stone-900 text-stone-100 flex items-center justify-center font-bold text-sm shrink-0">२</span>',
     '<span className="w-8 h-8 rounded-full bg-stone-900 text-stone-100 flex items-center justify-center font-bold text-sm shrink-0">2</span>'),
    ('<span className="w-8 h-8 rounded-full bg-stone-900 text-stone-100 flex items-center justify-center font-bold text-sm shrink-0">३</span>',
     '<span className="w-8 h-8 rounded-full bg-stone-900 text-stone-100 flex items-center justify-center font-bold text-sm shrink-0">3</span>'),
    ('<span className="w-8 h-8 rounded-full bg-stone-900 text-stone-100 flex items-center justify-center font-bold text-sm shrink-0">४</span>',
     '<span className="w-8 h-8 rounded-full bg-stone-900 text-stone-100 flex items-center justify-center font-bold text-sm shrink-0">4</span>')
])

# 5. apps/web/src/components/LayoutOptionsDrawer.tsx
replace_in_file('apps/web/src/components/LayoutOptionsDrawer.tsx', [
    ('<option value={2}>२ कॉलम (डाइजेस्ट)</option>', '<option value={2}>2 कॉलम (डाइजेस्ट)</option>'),
    ('<option value={3}>३ कॉलम (आधुनिक दैनिक)</option>', '<option value={3}>3 कॉलम (आधुनिक दैनिक)</option>'),
    ('<option value={4}>४ कॉलम (मानक समाचार पत्र)</option>', '<option value={4}>4 कॉलम (मानक समाचार पत्र)</option>'),
    ('<option value={5}>५ कॉलम (घना ब्रॉडशीट)</option>', '<option value={5}>5 कॉलम (घना ब्रॉडशीट)</option>'),
    ('<option value={6}>६ कॉलम (पारंपरिक प्रेस)</option>', '<option value={6}>6 कॉलम (पारंपरिक प्रेस)</option>'),
    ('placeholder="वर्ष ७८ • अंक १४२"', 'placeholder="वर्ष 78 • अंक 142"'),
    ('placeholder="मंगलवार, २७ अक्टूबर २०२६"', 'placeholder="मंगलवार, 27 अक्टूबर 2026"'),
    ('placeholder="मूल्य: ₹५.००"', 'placeholder="मूल्य: ₹5.00"'),
    ('placeholder="मौसम: सुहावना, २५° से. • वायु गुणवत्ता: मध्यम"', 'placeholder="मौसम: सुहावना, 25° से. • वायु गुणवत्ता: मध्यम"')
])

# 6. apps/web/src/components/landing/LandingPage.tsx
replace_in_file('apps/web/src/components/landing/LandingPage.tsx', [
    ('६८ देशों के बीच स्वच्छ ऊर्जा गलियारे', '68 देशों के बीच स्वच्छ ऊर्जा गलियारे'),
    ('मंगलवार, २७ अक्टूबर २०२६ • वर्ष ७८ • अंक १४२', 'मंगलवार, 27 अक्टूबर 2026 • वर्ष 78 • अंक 142'),
    ('मंगलवार, २७ अक्टूबर २०२६ • संस्करण: वाराणसी-प्रयागराज', 'मंगलवार, 27 अक्टूबर 2026 • संस्करण: वाराणसी-प्रयागराज'),
    ('गगनयान-२ मिशन', 'गगनयान-2 मिशन'),
    ('(१६:९, ४:३, १:१, ३:४)', '(16:9, 4:3, 1:1, 3:4)'),
    ('(पृष्ठ २, संस्करण तिथि, समाचार पत्र शीर्षक)', '(पृष्ठ 2, संस्करण तिथि, समाचार पत्र शीर्षक)'),
    ('मौसम: सुहावना, २५° से. • वायु गुणवत्ता: मध्यम', 'मौसम: सुहावना, 25° से. • वायु गुणवत्ता: मध्यम'),
    ('मूल्य: ₹५.०० • पृष्ठ संख्या: ८', 'मूल्य: ₹5.00 • पृष्ठ संख्या: 8'),
    ('वर्ष ७८ • अंक १४२', 'वर्ष 78 • अंक 142'),
    ('मंगलवार, २७ अक्टूबर २०२६', 'मंगलवार, 27 अक्टूबर 2026'),
    ('लगातार छह दिनों तक चली गहन वार्ताओं के उपरांत ६८', 'लगातार छह दिनों तक चली गहन वार्ताओं के उपरांत 68'),
    ('01', '01'),
    ('Broadsheet (१५"×२२.७५"), Tabloid (११"×१७")', 'Broadsheet (15"×22.75"), Tabloid (11"×17")'),
    ('© २०२६ E-Paper Studio', '© 2026 E-Paper Studio')
])

# 7. apps/web/src/components/studio/LeftSidebar.tsx
replace_in_file('apps/web/src/components/studio/LeftSidebar.tsx', [
    ('प्रातः ९ बजे से दोपहर २ बजे तक', 'प्रातः 9 बजे से दोपहर 2 बजे तक')
])

# 8. apps/web/src/components/studio/NewspaperCanvas.tsx
replace_in_file('apps/web/src/components/studio/NewspaperCanvas.tsx', [
    ("masthead.weatherNotice || 'सुहावना, २५° से.'", "masthead.weatherNotice || 'सुहावना, 25° से.'"),
    ("masthead.price || '₹५.००'", "masthead.price || '₹5.00'"),
    ("masthead.issueNumber || 'वर्ष ७८ • अंक १४२'", "masthead.issueNumber || 'वर्ष 78 • अंक 142'")
])

# 9. apps/web/src/components/studio/ProjectSetupModal.tsx
replace_in_file('apps/web/src/components/studio/ProjectSetupModal.tsx', [
    ('स्थापना १९४७', 'स्थापना 1947'),
    ('मंगलवार, २७ अक्टूबर २०२६', 'मंगलवार, 27 अक्टूबर 2026'),
    ("'२७ अक्टूबर २०२६'", "'27 अक्टूबर 2026'")
])

# 10. packages/document-schema/src/index.test.ts
replace_in_file('packages/document-schema/src/index.test.ts', [
    ("issueNumber: 'अंक १'", "issueNumber: 'अंक 1'"),
    ("date: '२७ अक्टूबर २०२६'", "date: '27 अक्टूबर 2026'"),
    ("price: '₹५.००'", "price: '₹5.00'"),
    ("footerText: 'पृष्ठ १'", "footerText: 'पृष्ठ 1'")
])

# 11. tests/e2e/studio.spec.ts
replace_in_file('tests/e2e/studio.spec.ts', [
    ('/पृष्ठ (2|२) \\/ (2|२)/', '/पृष्ठ 2 \\/ 2/')
])

# 12. tests/pdf/production-audit.spec.ts
replace_in_file('tests/pdf/production-audit.spec.ts', [
    ('स्थापना १९४७', 'स्थापना 1947'),
    ('मंगलवार, २७ अक्टूबर २०२६', 'मंगलवार, 27 अक्टूबर 2026'),
    ('तापमान २४°C', 'तापमान 24°C'),
    ('₹५.००', '₹5.00'),
    ('६८ देशों के बीच', '68 देशों के बीच'),
    ('ईसा पूर्व २६००', 'ईसा पूर्व 2600')
])
