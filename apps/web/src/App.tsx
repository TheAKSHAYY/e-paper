import React from 'react';
import { DeviceBadge, THEME_TOKENS } from '@epaper-studio/ui';
import { SupportedDeviceSchema } from '@epaper-studio/document-schema';

export const App: React.FC = () => {
  const devices = SupportedDeviceSchema.options;

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: THEME_TOKENS.einkBackground,
        color: THEME_TOKENS.einkTextPrimary,
        fontFamily: 'serif',
        padding: '3rem 2rem',
        maxWidth: '900px',
        margin: '0 auto',
      }}
    >
      <header
        style={{ borderBottom: `2px solid ${THEME_TOKENS.borderPaper}`, paddingBottom: '1.5rem' }}
      >
        <h1 style={{ fontSize: '2.5rem', margin: '0 0 0.5rem 0', letterSpacing: '-0.02em' }}>
          E-Paper Studio
        </h1>
        <p style={{ margin: 0, color: THEME_TOKENS.einkTextMuted, fontSize: '1.1rem' }}>
          Scalable Multilingual E-Paper Publishing Engine — Foundation Environment
        </p>
      </header>

      <main style={{ marginTop: '2rem' }}>
        <section style={{ marginBottom: '2rem' }}>
          <h2
            style={{ fontSize: '1.4rem', borderBottom: '1px solid #ddd', paddingBottom: '0.4rem' }}
          >
            Target Hardware Profiles
          </h2>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
            {devices.map((device) => (
              <DeviceBadge key={device} deviceName={device} dpi={300} />
            ))}
          </div>
        </section>

        <section
          style={{
            backgroundColor: '#fff',
            border: `1px solid ${THEME_TOKENS.borderPaper}`,
            padding: '1.5rem',
            borderRadius: '4px',
          }}
        >
          <h3 style={{ margin: '0 0 0.5rem 0' }}>Development Foundation Ready</h3>
          <p style={{ margin: 0, color: THEME_TOKENS.einkTextMuted, lineHeight: '1.6' }}>
            Monorepo packages, document schema AST, typography cascades, and test fixtures are
            initialized. Awaiting architectural sign-off before feature implementation.
          </p>
        </section>
      </main>
    </div>
  );
};
