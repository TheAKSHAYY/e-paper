import React, { useState, useEffect } from 'react';
import type { DraftSummary } from '../storage/types';
import { draftStorage } from '../storage';

export interface DraftsManagerModalProps {
  isOpen: boolean;
  activeDraftId: string;
  onClose: () => void;
  onLoadDraft: (id: string) => Promise<void>;
  onDeleteDraft: (id: string) => Promise<void>;
  onNewDraft: () => void;
}

export const DraftsManagerModal: React.FC<DraftsManagerModalProps> = ({
  isOpen,
  activeDraftId,
  onClose,
  onLoadDraft,
  onDeleteDraft,
  onNewDraft,
}) => {
  const [drafts, setDrafts] = useState<DraftSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDrafts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const list = await draftStorage.listDrafts();
      setDrafts(list);
    } catch (err) {
      setError('Failed to retrieve saved drafts from browser storage.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      void fetchDrafts();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.65)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
    >
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          maxWidth: '650px',
          width: '100%',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
          border: '1px solid #ccc',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #eee',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#fbfaf6',
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontFamily: 'serif', color: '#111' }}>
              📁 सहेजे गए अख़बार (Saved Drafts)
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#666' }}>
              ब्राउज़र में सुरक्षित रखे गए ड्राफ़्ट। पहले बनाए गए संस्करण खोलें या हटाएँ।
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="बंद करें"
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              color: '#666',
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: '16px 20px', overflowY: 'auto', flex: 1 }}>
          {error && (
            <div
              style={{
                backgroundColor: '#ffebee',
                color: '#c62828',
                padding: '10px',
                borderRadius: '4px',
                fontSize: '12px',
                marginBottom: '12px',
              }}
            >
              ⚠️ {error}
            </div>
          )}

          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '30px', color: '#777', fontSize: '13px' }}>
              ड्राफ्ट लोड हो रहे हैं...
            </div>
          ) : drafts.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: '#888',
                border: '2px dashed #ddd',
                borderRadius: '6px',
              }}
            >
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>🗞️</div>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>
                कोई सहेजा गया ड्राफ्ट नहीं मिला
              </p>
              <p style={{ margin: '4px 0 16px 0', fontSize: '12px', color: '#999' }}>
                आपके द्वारा बनाए गए समाचार पत्र यहाँ दिखाई देंगे।
              </p>
              <button
                onClick={() => {
                  onClose();
                  onNewDraft();
                }}
                style={{
                  backgroundColor: '#8b0000',
                  color: '#fff',
                  border: 'none',
                  padding: '6px 16px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                पहला अख़बार बनाएँ
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {drafts.map((d) => {
                const isActive = d.id === activeDraftId;
                const formattedDate = new Date(d.updatedAt).toLocaleString('hi-IN', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={d.id}
                    data-testid={`draft-card-${d.id}`}
                    style={{
                      border: isActive ? '2px solid #8b0000' : '1px solid #dcd7cc',
                      backgroundColor: isActive ? '#fffcf5' : '#ffffff',
                      borderRadius: '6px',
                      padding: '12px 16px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '12px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '4px',
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 800,
                            fontSize: '14px',
                            color: '#111',
                            fontFamily: 'serif',
                          }}
                        >
                          {d.title}
                        </span>
                        {isActive && (
                          <span
                            style={{
                              fontSize: '10px',
                              backgroundColor: '#e8f5e9',
                              color: '#2e7d32',
                              padding: '1px 6px',
                              borderRadius: '3px',
                              fontWeight: 700,
                            }}
                          >
                            सक्रिय (ACTIVE)
                          </span>
                        )}
                      </div>

                      <div
                        style={{
                          fontSize: '11px',
                          color: '#666',
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '10px',
                        }}
                      >
                        <span>संस्करण: {d.edition}</span>
                        <span>•</span>
                        <span>
                          {d.articleCount} {d.articleCount === 1 ? 'खबर' : 'खबरें'}
                        </span>
                        <span>•</span>
                        <span>आकार: {d.pageSize.toUpperCase()}</span>
                        <span>•</span>
                        <span>सहेजा: {formattedDate}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={async () => {
                          await onLoadDraft(d.id);
                          onClose();
                        }}
                        data-testid={`btn-load-draft-${d.id}`}
                        style={{
                          backgroundColor: isActive ? '#eee' : '#1b5e20',
                          color: isActive ? '#555' : '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '6px 12px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {isActive ? 'पुनः खोलें' : 'खोलें'}
                      </button>

                      <button
                        onClick={async () => {
                          if (
                            window.confirm(
                              `क्या आप ड्राफ्ट "${d.title}" को मिटाना चाहते हैं? यह वापस नहीं लाया जा सकेगा।`
                            )
                          ) {
                            await onDeleteDraft(d.id);
                            await fetchDrafts();
                          }
                        }}
                        title="ड्राफ्ट मिटाएँ"
                        aria-label={`ड्राफ्ट मिटाएँ ${d.title}`}
                        style={{
                          backgroundColor: '#ffebee',
                          color: '#c62828',
                          border: '1px solid #ffcdd2',
                          borderRadius: '4px',
                          padding: '6px 10px',
                          fontSize: '12px',
                          cursor: 'pointer',
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid #eee',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#fbfaf6',
          }}
        >
          <button
            onClick={() => {
              onClose();
              onNewDraft();
            }}
            style={{
              backgroundColor: '#1b5e20',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            + नया अख़बार
          </button>

          <button
            onClick={onClose}
            style={{
              backgroundColor: '#eee',
              border: '1px solid #ccc',
              padding: '6px 14px',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            बंद करें
          </button>
        </div>
      </div>
    </div>
  );
};
