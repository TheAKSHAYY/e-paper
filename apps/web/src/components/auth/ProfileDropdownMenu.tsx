import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { useI18n } from '../../i18n';

export interface ProfileDropdownMenuProps {
  onOpenSettings: () => void;
  onSignOut: () => void;
  variant?: 'light' | 'dark';
}

export const ProfileDropdownMenu: React.FC<ProfileDropdownMenuProps> = ({
  onOpenSettings,
  onSignOut,
  variant = 'light',
}) => {
  const { locale, setLocale } = useI18n();
  const { user, profile, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isAuthenticated || !user) return null;

  const displayName = profile?.fullName || user.fullName || 'Chief Editor';
  const initial = displayName.charAt(0).toUpperCase() || 'E';

  return (
    <div style={{ position: 'relative' }} ref={menuRef}>
      {/* Avatar Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          backgroundColor: variant === 'dark' ? '#FAF8F5' : '#1C1917',
          color: variant === 'dark' ? '#1C1917' : '#FAF8F5',
          border: 'none',
          fontSize: '13px',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}
        title={displayName}
      >
        {initial}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '40px',
            right: 0,
            width: '240px',
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            padding: '8px 0',
            zIndex: 100,
            color: '#111827',
          }}
          role="menu"
        >
          {/* User Info Header */}
          <div style={{ padding: '10px 16px', borderBottom: '1px solid #F3F4F6' }}>
            <div
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: '#111827',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {displayName}
            </div>
            <div
              style={{
                fontSize: '11px',
                color: '#6B7280',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {user.email}
            </div>
            <div style={{ marginTop: '6px' }}>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  backgroundColor: '#F3F4F6',
                  color: '#4B5563',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                {profile?.role || 'Chief Editor'}
              </span>
            </div>
          </div>

          {/* Menu Items */}
          <div style={{ padding: '4px 0' }}>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenSettings();
              }}
              style={{
                width: '100%',
                padding: '8px 16px',
                textAlign: 'left',
                border: 'none',
                background: 'none',
                fontSize: '13px',
                color: '#374151',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
              className="hover:bg-stone-50"
              role="menuitem"
            >
              <span>⚙️</span>
              <span>{locale === 'hi' ? 'खाता सेटिंग्स' : 'Account Settings'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setLocale(locale === 'hi' ? 'en' : 'hi');
                setIsOpen(false);
              }}
              style={{
                width: '100%',
                padding: '8px 16px',
                textAlign: 'left',
                border: 'none',
                background: 'none',
                fontSize: '13px',
                color: '#374151',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
              className="hover:bg-stone-50"
              role="menuitem"
            >
              <span>🌐</span>
              <span>{locale === 'hi' ? 'Switch to English' : 'हिन्दी में बदलें'}</span>
            </button>
          </div>

          <div style={{ borderTop: '1px solid #F3F4F6', padding: '4px 0 0 0' }}>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onSignOut();
              }}
              style={{
                width: '100%',
                padding: '8px 16px',
                textAlign: 'left',
                border: 'none',
                background: 'none',
                fontSize: '13px',
                color: '#DC2626',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
              className="hover:bg-red-50"
              role="menuitem"
            >
              <span>🚪</span>
              <span>{locale === 'hi' ? 'लॉग आउट' : 'Sign Out'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
