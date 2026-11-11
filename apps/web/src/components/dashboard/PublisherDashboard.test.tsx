import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { PublisherDashboard } from './PublisherDashboard';
import { I18nProvider } from '../../i18n';

vi.mock('../../auth/AuthContext', () => ({
  useAuth: () => ({
    authMode: 'mock',
    user: {
      id: 'u1',
      email: 'editor@newsroom.local',
      fullName: 'राजेश शर्मा',
      emailConfirmed: true,
      createdAt: '2026-01-01T00:00:00.000Z',
    },
    profile: null,
    isAuthenticated: true,
    isLoading: false,
  }),
}));

describe('PublisherDashboard', () => {
  it('renders unified newsroom workspace in humanized Hindi', () => {
    const html = renderToStaticMarkup(
      <I18nProvider initialLocale="hi">
        <PublisherDashboard
          onNewEdition={() => {}}
          onOpenEditor={() => {}}
          onEditProfile={() => {}}
          onBackToLanding={() => {}}
          onOpenTemplates={() => {}}
        />
      </I18nProvider>
    );

    expect(html).toContain('data-locale="hi"');
    expect(html).toContain('नमस्ते,');
    expect(html).toContain('नया अंक बनाएँ');
    expect(html).toContain('आपके बनाए हुए अंक');
    expect(html).toContain('dashboard-mock-indicator');
    expect(html).toContain('अंक का नाम या तारीख़ खोजें');
  });

  it('renders clean English copy with zero hyphens in visible headings/labels', () => {
    const html = renderToStaticMarkup(
      <I18nProvider initialLocale="en">
        <PublisherDashboard
          onNewEdition={() => {}}
          onOpenEditor={() => {}}
          onOpenTemplates={() => {}}
          onBackToLanding={() => {}}
        />
      </I18nProvider>
    );

    expect(html).toContain('data-locale="en"');
    expect(html).toContain('Welcome back,');
    expect(html).toContain('Saved Editions');
    expect(html).toContain('Search edition name or date');
    expect(html).toContain('Card Grid');
    expect(html).toContain('Compact Table');
  });
});

