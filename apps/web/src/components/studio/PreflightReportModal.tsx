import React, { useState } from 'react';
import type { PreflightReport, PreflightIssue } from '@epaper-studio/document-schema';

export interface PreflightReportModalProps {
  isOpen: boolean;
  report: PreflightReport | null;
  onClose: () => void;
  onExportDirectly: () => void;
  onNavigateToIssue: (pageIndex: number, articleId?: string) => void;
  onApplyAutoFix: (issue: PreflightIssue) => void;
  onResolveAllAutoFixable?: () => void;
  isExporting?: boolean;
}

export const PreflightReportModal: React.FC<PreflightReportModalProps> = ({
  isOpen,
  report,
  onClose,
  onExportDirectly,
  onNavigateToIssue,
  onApplyAutoFix,
  onResolveAllAutoFixable,
  isExporting = false,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'red' | 'yellow'>('all');

  if (!isOpen || !report) return null;

  const blockers = report.issues.filter((i) => i.severity === 'red');
  const warnings = report.issues.filter((i) => i.severity === 'yellow');
  const autoFixableCount = report.issues.filter((i) => i.autoFixAvailable).length;

  const displayedIssues =
    filterSeverity === 'all' ? report.issues : filterSeverity === 'red' ? blockers : warnings;

  const getStatusBanner = () => {
    if (report.overallStatus === 'green') {
      return {
        bg: '#f0fdf4',
        border: '#86efac',
        icon: '✓',
        title: 'प्रीफ़्लाइट संपन्न: प्रकाशन के लिए पूरी तरह तैयार (Ready to Publish)',
        subtitle:
          'दस्तावेज़ के सभी 12 गुणवत्ता मानकों की जांच सफल रही। कोई टेक्स्ट ओवरफ्लो या फ़्रेम त्रुटि नहीं मिली।',
        color: '#15803d',
      };
    }
    if (report.overallStatus === 'yellow') {
      return {
        bg: '#fffbeb',
        border: '#fde68a',
        icon: '⚠️',
        title: `प्रीफ़्लाइट समीक्षा: ${warnings.length} चेतावनियाँ (Review Recommended)`,
        subtitle:
          'दस्तावेज़ में कुछ गैर-महत्वपूर्ण चेतावनियाँ हैं। आप इन्हें ठीक कर सकते हैं या वैसे ही PDF एक्सपोर्ट कर सकते हैं।',
        color: '#b45309',
      };
    }
    return {
      bg: '#fef2f2',
      border: '#fca5a5',
      icon: '⛔',
      title: `प्रीफ़्लाइट रुकावट: ${blockers.length} गंभीर त्रुटियाँ (Export Blocked)`,
      subtitle:
        'कुछ समाचार ब्लॉकों में टेक्स्ट कट रहा है या फ़्रेम पृष्ठ सीमा से बाहर है। PDF तैयार करने से पहले इन्हें ठीक करें।',
      color: '#b91c1c',
    };
  };

  const banner = getStatusBanner();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="preflight-modal-title"
      data-testid="preflight-report-modal"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px',
        backdropFilter: 'blur(3px)',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          maxWidth: '680px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
          overflow: 'hidden',
          border: '1px solid #e2e8f0',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '16px 20px',
            backgroundColor: banner.bg,
            borderBottom: `1px solid ${banner.border}`,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '26px', lineHeight: 1 }}>{banner.icon}</span>
            <div>
              <h2
                id="preflight-modal-title"
                style={{
                  margin: 0,
                  fontSize: '16px',
                  fontWeight: 800,
                  color: banner.color,
                }}
              >
                {banner.title}
              </h2>
              <p
                style={{
                  margin: '4px 0 0 0',
                  fontSize: '12px',
                  color: '#475569',
                  lineHeight: 1.4,
                }}
              >
                {banner.subtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="बंद करें"
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              color: '#64748b',
              padding: '2px 6px',
              borderRadius: '4px',
            }}
          >
            ✕
          </button>
        </div>

        {/* 12-Point Status Metrics Bar */}
        <div
          style={{
            padding: '10px 20px',
            backgroundColor: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            fontSize: '12px',
          }}
        >
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setFilterSeverity('all')}
              style={{
                padding: '3px 8px',
                borderRadius: '4px',
                border: 'none',
                background: filterSeverity === 'all' ? '#1e293b' : '#e2e8f0',
                color: filterSeverity === 'all' ? '#ffffff' : '#334155',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              सभी मुद्दे ({report.issues.length})
            </button>
            {blockers.length > 0 && (
              <button
                onClick={() => setFilterSeverity('red')}
                style={{
                  padding: '3px 8px',
                  borderRadius: '4px',
                  border: 'none',
                  background: filterSeverity === 'red' ? '#b91c1c' : '#fee2e2',
                  color: filterSeverity === 'red' ? '#ffffff' : '#991b1b',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                रुकावटें ({blockers.length})
              </button>
            )}
            {warnings.length > 0 && (
              <button
                onClick={() => setFilterSeverity('yellow')}
                style={{
                  padding: '3px 8px',
                  borderRadius: '4px',
                  border: 'none',
                  background: filterSeverity === 'yellow' ? '#b45309' : '#fef3c7',
                  color: filterSeverity === 'yellow' ? '#ffffff' : '#92400e',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                चेतावनियाँ ({warnings.length})
              </button>
            )}
          </div>

          <div style={{ color: '#64748b', fontWeight: 500 }}>
            कुल 12 मानक जांचे गए • {12 - blockers.length - warnings.length} उत्तीर्ण
          </div>
        </div>

        {/* Issues List Body */}
        <div
          style={{
            padding: '16px 20px',
            overflowY: 'auto',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            backgroundColor: '#ffffff',
          }}
        >
          {displayedIssues.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: '#15803d',
              }}
            >
              <div style={{ fontSize: '40px', marginBottom: '8px' }}>✓</div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>
                कोई समस्या नहीं पाई गई!
              </h3>
              <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#64748b' }}>
                सभी पृष्ठ मानक प्रिंट मार्जिन, यूनिकोड देवनागरी और आयामों के अनुकूल हैं।
              </p>
            </div>
          ) : (
            displayedIssues.map((issue) => {
              const isBlocker = issue.severity === 'red';
              return (
                <div
                  key={issue.id}
                  data-testid={`preflight-issue-${issue.id}`}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '6px',
                    border: `1px solid ${isBlocker ? '#fecaca' : '#fde68a'}`,
                    backgroundColor: isBlocker ? '#fef2f2' : '#fffbeb',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          padding: '2px 6px',
                          borderRadius: '3px',
                          fontSize: '10.5px',
                          fontWeight: 800,
                          backgroundColor: isBlocker ? '#b91c1c' : '#b45309',
                          color: '#ffffff',
                          textTransform: 'uppercase',
                        }}
                      >
                        {isBlocker ? 'रुकावट (Blocker)' : 'चेतावनी (Warning)'}
                      </span>
                      {issue.pageNumber !== undefined && (
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            color: '#475569',
                            backgroundColor: '#e2e8f0',
                            padding: '2px 6px',
                            borderRadius: '3px',
                          }}
                        >
                          पृष्ठ {issue.pageNumber}
                        </span>
                      )}
                      <span
                        style={{
                          fontSize: '13px',
                          fontWeight: 700,
                          color: '#0f172a',
                        }}
                      >
                        {issue.title}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      {issue.autoFixAvailable && (
                        <button
                          onClick={() => onApplyAutoFix(issue)}
                          title="इस समस्या को स्वतः सुधारें"
                          style={{
                            padding: '4px 8px',
                            backgroundColor: '#0284c7',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          ⚡ स्वतः सुधारें
                        </button>
                      )}
                      {issue.pageIndex !== undefined && (
                        <button
                          onClick={() => {
                            onNavigateToIssue(issue.pageIndex!, issue.articleId);
                            onClose();
                          }}
                          style={{
                            padding: '4px 8px',
                            backgroundColor: '#ffffff',
                            color: '#2563eb',
                            border: '1px solid #cbd5e1',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          ब्लॉक पर जाएं →
                        </button>
                      )}
                    </div>
                  </div>

                  <p
                    style={{
                      margin: 0,
                      fontSize: '12px',
                      color: '#334155',
                      lineHeight: 1.4,
                    }}
                  >
                    {issue.explanation}
                  </p>

                  <div
                    style={{
                      fontSize: '11.5px',
                      color: '#0369a1',
                      backgroundColor: 'rgba(2, 132, 199, 0.08)',
                      padding: '4px 8px',
                      borderRadius: '4px',
                    }}
                  >
                    💡 <strong>सुझाव:</strong> {issue.suggestedCorrection}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer Controls */}
        <div
          style={{
            padding: '14px 20px',
            backgroundColor: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={onClose}
              style={{
                padding: '8px 14px',
                borderRadius: '5px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#334155',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              संपादित करने के लिए वापस जाएं
            </button>
            {autoFixableCount > 0 && onResolveAllAutoFixable && (
              <button
                onClick={onResolveAllAutoFixable}
                style={{
                  padding: '8px 14px',
                  borderRadius: '5px',
                  border: 'none',
                  background: '#0284c7',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                ⚡ सभी संभव सुधार लागू करें ({autoFixableCount})
              </button>
            )}
          </div>

          <button
            data-testid="preflight-btn-export"
            onClick={onExportDirectly}
            disabled={!report.canExport || isExporting}
            style={{
              padding: '8px 18px',
              borderRadius: '5px',
              border: 'none',
              background: report.canExport ? '#b91c1c' : '#94a3b8',
              color: '#ffffff',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: report.canExport && !isExporting ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>📥</span>
            <span>
              {isExporting
                ? 'PDF तैयार हो रहा है...'
                : report.canExport
                  ? warnings.length > 0
                    ? 'चेतावनियों के साथ PDF डाउनलोड करें'
                    : 'प्रिंट-रेडी PDF डाउनलोड करें'
                  : 'पहले रुकावटें ठीक करें'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
