import React from 'react';
import ReactDOM from 'react-dom/client';
import { I18nProvider } from './i18n';
import { AuthProvider } from './auth/AuthContext';
import { App } from './App';

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <I18nProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </I18nProvider>
    </React.StrictMode>
  );
}
