import { describe, it, expect } from 'vitest';
import {
  sanitizeWhatsAppHeader,
  parseSingleWhatsAppStory,
  parseWhatsAppDispatch,
} from './whatsappParser';

describe('WhatsApp News Parser', () => {
  it('should strip WhatsApp forward tags and timestamps', () => {
    const raw = `[10:45 AM, 11/10/2026] Reporter Ramesh: Forwarded
*सड़क दुर्घटना में 4 घायल, राहत कार्य जारी*
लखनऊ — लखनऊ-कानपुर हाईवे पर आज सुबह घना कोहरा होने से एक बस डिवाइडर से टकरा गई। घायलों को पास के अस्पताल में भर्ती कराया गया है।`;

    const sanitized = sanitizeWhatsAppHeader(raw);
    expect(sanitized).not.toContain('[10:45 AM');
    expect(sanitized).not.toContain('Forwarded');
    expect(sanitized).toContain('सड़क दुर्घटना');
  });

  it('should parse single news story with headline, dateline, byline and body', () => {
    const text = `🔴 *संसद में ऐतिहासिक विधेयक पारित*
विशेष संवाददाता: कुलदीप अवस्थी
नई दिल्ली — संसद के दोनों सदनों में आज ध्वनिमत से विधेयक पारित हो गया। पक्ष और विपक्ष के सदस्यों ने ऐतिहासिक सुधार का स्वागत किया।`;

    const parsed = parseSingleWhatsAppStory(text);
    expect(parsed.headline).toBe('संसद में ऐतिहासिक विधेयक पारित');
    expect(parsed.byline).toBe('कुलदीप अवस्थी');
    expect(parsed.dateline).toBe('नई दिल्ली —');
    expect(parsed.body).toContain('संसद के दोनों सदनों में आज ध्वनिमत');
  });

  it('should split multi-story dispatches cleanly', () => {
    const multiDispatch = `
*पहली खबर: भारी बारिश से जनजीवन अस्त-व्यस्त*
जयपुर — शहर में रात भर तेज बारिश से निचले इलाकों में पानी भर गया।

---

*दूसरी खबर: किसान क्रेडिट कार्ड पर विशेष छूट*
भोपाल — राज्य सरकार ने किसानों को ब्याज मुक्त ऋण देने का निर्णय लिया।
`;

    const stories = parseWhatsAppDispatch(multiDispatch);
    expect(stories.length).toBe(2);
    expect(stories[0]?.headline).toBe('पहली खबर: भारी बारिश से जनजीवन अस्त-व्यस्त');
    expect(stories[0]?.dateline).toBe('जयपुर —');
    expect(stories[1]?.headline).toBe('दूसरी खबर: किसान क्रेडिट कार्ड पर विशेष छूट');
    expect(stories[1]?.dateline).toBe('भोपाल —');
  });

  it('should handle English dispatches gracefully', () => {
    const text = `*ISRO Prepares for Next Moon Mission Launch*
Reporter: Vikram Rao
Bengaluru — The Indian Space Research Organisation announced the final phase of rover trials today.`;

    const parsed = parseSingleWhatsAppStory(text);
    expect(parsed.headline).toBe('ISRO Prepares for Next Moon Mission Launch');
    expect(parsed.byline).toBe('Vikram Rao');
    expect(parsed.dateline).toBe('Bengaluru —');
    expect(parsed.body).toContain('The Indian Space Research Organisation');
  });
});
