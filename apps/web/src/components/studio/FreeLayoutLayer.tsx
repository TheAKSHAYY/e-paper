import React, { useState, useRef, useEffect, useCallback } from 'react';
import type {
  Article,
  NewspaperPage,
  NewspaperDocument,
  FrameMm,
  PageSizePreset,
  PageOrientation,
} from '@epaper-studio/document-schema';
import {
  screenToPageMm,
  getPageLayoutBounds,
  snapFrame,
  swapFrames,
  calculatePageFullness,
  findNearestFreeSlot,
  type SnapGuide,
} from '@epaper-studio/template-engine';

export interface FreeLayoutLayerProps {
  page: NewspaperPage;
  doc: NewspaperDocument;
  pageSize: PageSizePreset;
  orientation: PageOrientation;
  scale?: number;
  selectedArticleId: string | null;
  onSelectArticle: (id: string) => void;
  onUpdateArticleFrame: (id: string, frame: FrameMm) => void;
  onSwapArticles: (idA: string, idB: string) => void;
  onToggleLayoutMode?: (mode: 'auto' | 'free') => void;
  onAddBlock?: (template: Partial<Article>) => void;
  onAddPage?: () => void;
  isMobile?: boolean;
  sheetContainerRef: React.RefObject<HTMLDivElement | null>;
  renderArticleContent: (article: Article, isSelected: boolean) => React.ReactNode;
}

type ResizeDirection = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

export const FreeLayoutLayer: React.FC<FreeLayoutLayerProps> = ({
  page,
  doc,
  scale = 1.0,
  selectedArticleId,
  onSelectArticle,
  onUpdateArticleFrame,
  onSwapArticles,
  onToggleLayoutMode,
  onAddBlock,
  onAddPage,
  isMobile: _isMobile = false,
  sheetContainerRef,
  renderArticleContent,
}) => {
  const bounds = getPageLayoutBounds(page, doc);
  const fullness = calculatePageFullness(page, doc);

  // Interaction States
  const [activeGuides, setActiveGuides] = useState<SnapGuide[]>([]);
  const [isTapToSwapActive, setIsTapToSwapActive] = useState(false);
  const [swapSourceId, setSwapSourceId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [overflowingArticles, setOverflowingArticles] = useState<Record<string, boolean>>({});

  // Drag & Resize tracking
  const [dragState, setDragState] = useState<{
    type: 'move' | 'resize';
    articleId: string;
    dir?: ResizeDirection;
    startPointerMm: { xMm: number; yMm: number };
    startFrame: FrameMm;
    currentFrame: FrameMm;
  } | null>(null);

  // Long-press timer for phone pickup
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Show status notification toast
  const showToast = useCallback((msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3200);
  }, []);

  // Measure overflow on each frame using ref callback
  const articleRefs = useRef<Map<string, HTMLElement>>(new Map());

  const checkOverflows = useCallback(() => {
    const newOverflows: Record<string, boolean> = {};
    articleRefs.current.forEach((el, id) => {
      if (el) {
        const isOverflow = el.scrollHeight > el.clientHeight + 1;
        newOverflows[id] = isOverflow;
      }
    });
    setOverflowingArticles(newOverflows);
  }, []);

  useEffect(() => {
    checkOverflows();
  }, [page.articles, checkOverflows]);

  // Pointer coordinate converter helper
  const getPointerMm = useCallback(
    (e: React.PointerEvent | PointerEvent) => {
      const container = sheetContainerRef.current;
      if (!container) return { xMm: 0, yMm: 0, isInside: false };
      const rect = container.getBoundingClientRect();
      return screenToPageMm(
        { clientX: e.clientX, clientY: e.clientY },
        rect,
        scale,
        { widthMm: doc.metadata.pageSize === 'broadsheet' ? 381 : 280, heightMm: 578 }
      );
    },
    [sheetContainerRef, scale, doc.metadata.pageSize]
  );

  // 1. Move Drag Handlers
  const handlePointerDownArticle = (e: React.PointerEvent, art: Article) => {
    e.stopPropagation();

    // If tap-to-swap mode is active
    if (isTapToSwapActive && swapSourceId) {
      if (swapSourceId !== art.id) {
        const swapResult = swapFrames(page, doc, swapSourceId, art.id);
        if (swapResult.success) {
          onSwapArticles(swapSourceId, art.id);
          showToast('ब्लॉक की स्थिति सफलतापूर्वक बदल दी गई! (Swapped)');
        } else {
          showToast(swapResult.message || 'Swap संभव नहीं है: स्थान कम है।');
        }
      }
      setIsTapToSwapActive(false);
      setSwapSourceId(null);
      return;
    }

    onSelectArticle(art.id);

    const startPointer = getPointerMm(e);
    const startFrame = art.frame ?? { x: bounds.minX, y: bounds.minY, w: 80, h: 50, z: 1 };

    // Function to start moving
    const startMove = () => {
      // Haptic feedback on phone if available
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate?.(50);
        } catch {
          // ignore vibration restriction
        }
      }

      setDragState({
        type: 'move',
        articleId: art.id,
        startPointerMm: startPointer,
        startFrame,
        currentFrame: startFrame,
      });
    };

    if (e.pointerType === 'touch') {
      // Phone touch: requires 400ms long-press to pick up
      longPressTimerRef.current = setTimeout(startMove, 400);
    } else {
      // Mouse/Pen: immediate pick up on primary button
      if (e.button === 0) {
        startMove();
      }
    }
  };

  const handlePointerCancel = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  // 2. Resize Handle Drag Handler
  const handlePointerDownResize = (e: React.PointerEvent, art: Article, dir: ResizeDirection) => {
    e.stopPropagation();
    const startPointer = getPointerMm(e);
    const startFrame = art.frame ?? { x: bounds.minX, y: bounds.minY, w: 80, h: 50, z: 1 };

    setDragState({
      type: 'resize',
      articleId: art.id,
      dir,
      startPointerMm: startPointer,
      startFrame,
      currentFrame: startFrame,
    });
  };

  // 3. Pointer Move (Window level during drag)
  useEffect(() => {
    if (!dragState) return;

    const handlePointerMove = (e: PointerEvent) => {
      // Cancel long press if moved significantly before timer
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }

      const currentPointer = getPointerMm(e);
      const dx = currentPointer.xMm - dragState.startPointerMm.xMm;
      const dy = currentPointer.yMm - dragState.startPointerMm.yMm;
      const sf = dragState.startFrame;

      let candidate: FrameMm;

      if (dragState.type === 'move') {
        candidate = {
          ...sf,
          x: sf.x + dx,
          y: sf.y + dy,
        };
      } else {
        // Resize according to direction handle
        let newX = sf.x;
        let newY = sf.y;
        let newW = sf.w;
        let newH = sf.h;

        const dir = dragState.dir!;

        if (dir.includes('e')) {
          newW = Math.max(20, sf.w + dx);
        }
        if (dir.includes('s')) {
          newH = Math.max(15, sf.h + dy);
        }
        if (dir.includes('w')) {
          const maxDx = sf.w - 20;
          const clampedDx = Math.min(dx, maxDx);
          newX = sf.x + clampedDx;
          newW = sf.w - clampedDx;
        }
        if (dir.includes('n')) {
          const maxDy = sf.h - 15;
          const clampedDy = Math.min(dy, maxDy);
          newY = sf.y + clampedDy;
          newH = sf.h - clampedDy;
        }

        candidate = {
          x: Number(newX.toFixed(2)),
          y: Number(newY.toFixed(2)),
          w: Number(newW.toFixed(2)),
          h: Number(newH.toFixed(2)),
          z: sf.z ?? 1,
        };
      }

      // Snap to columns, 4mm vertical modules, margins, siblings
      const snap = snapFrame(candidate, page, doc, dragState.articleId, 3.5);
      setActiveGuides(snap.activeGuides);
      setDragState((prev) => (prev ? { ...prev, currentFrame: snap.frame } : null));
    };

    const handlePointerUp = () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }

      if (dragState) {
        const finalFrame = dragState.currentFrame;

        // Check if dropped onto another block for swap
        if (dragState.type === 'move') {
          const targetArticle = page.articles.find((art) => {
            if (art.id === dragState.articleId || !art.frame) return false;
            // Center point of dragged frame inside target frame
            const cx = finalFrame.x + finalFrame.w / 2;
            const cy = finalFrame.y + finalFrame.h / 2;
            return (
              cx >= art.frame.x &&
              cx <= art.frame.x + art.frame.w &&
              cy >= art.frame.y &&
              cy <= art.frame.y + art.frame.h
            );
          });

          if (targetArticle) {
            // Attempt swap
            const swapResult = swapFrames(page, doc, dragState.articleId, targetArticle.id);
            if (swapResult.success) {
              onSwapArticles(dragState.articleId, targetArticle.id);
              showToast(`"${targetArticle.headline.slice(0, 15)}..." के साथ ब्लॉक बदल दिया गया!`);
              setDragState(null);
              setActiveGuides([]);
              return;
            } else {
              showToast(swapResult.message || 'Swap संभव नहीं है: स्थान कम है।');
            }
          }
        }

        // Commit final frame update
        onUpdateArticleFrame(dragState.articleId, finalFrame);
      }

      setDragState(null);
      setActiveGuides([]);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [dragState, getPointerMm, page, doc, bounds, onUpdateArticleFrame, onSwapArticles, showToast]);

  // 4. Nudge Controls (D-pad & Dimensions)
  const handleNudge = (deltaX: number, deltaY: number, deltaW: number = 0, deltaH: number = 0) => {
    if (!selectedArticleId) return;
    const art = page.articles.find((a) => a.id === selectedArticleId);
    if (!art?.frame) return;

    const candidate: FrameMm = {
      ...art.frame,
      x: art.frame.x + deltaX,
      y: art.frame.y + deltaY,
      w: Math.max(20, art.frame.w + deltaW),
      h: Math.max(15, art.frame.h + deltaH),
    };

    const snap = snapFrame(candidate, page, doc, selectedArticleId, 1.0);
    onUpdateArticleFrame(selectedArticleId, snap.frame);
  };

  // 5. Add Block with Nearest Free Slot Check
  const handleAddNewBlockWithFreeSlot = (template: Partial<Article>) => {
    const defaultW = template.frame?.w ?? 90;
    const defaultH = template.frame?.h ?? 60;

    const slot = findNearestFreeSlot(page, doc, defaultW, defaultH);
    if (!slot.found || slot.xMm === undefined || slot.yMm === undefined) {
      showToast('Page bhar gaya - naya page jodein?');
      return;
    }

    if (onAddBlock) {
      onAddBlock({
        ...template,
        frame: {
          x: slot.xMm,
          y: slot.yMm,
          w: defaultW,
          h: defaultH,
          z: page.articles.length + 1,
        },
      });
      showToast('नया ब्लॉक खाली स्थान पर जोड़ा गया!');
    }
  };

  const selectedArticle = page.articles.find((a) => a.id === selectedArticleId);

  return (
    <div
      className="free-layout-canvas-layer"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 10,
      }}
    >
      {/* ==========================================================
       * 1. TOP STATUS & FULLNESS BAR
       * ========================================================== */}
      <div
        style={{
          position: 'absolute',
          top: '6px',
          right: '8px',
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          pointerEvents: 'auto',
        }}
      >
        {/* Page Fullness Badge */}
        <div
          data-testid="page-fullness-badge"
          style={{
            backgroundColor: fullness.fullnessPercent > 90 ? '#fef2f2' : '#f0fdf4',
            border: fullness.fullnessPercent > 90 ? '1px solid #f87171' : '1px solid #86efac',
            color: fullness.fullnessPercent > 90 ? '#b91c1c' : '#15803d',
            padding: '3px 8px',
            borderRadius: '9999px',
            fontSize: '11px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}
        >
          <span>📊</span>
          <span>{fullness.displayLabel}</span>
          <div
            style={{
              width: '40px',
              height: '5px',
              backgroundColor: '#e2e8f0',
              borderRadius: '9999px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${fullness.fullnessPercent}%`,
                height: '100%',
                backgroundColor: fullness.fullnessPercent > 90 ? '#ef4444' : '#22c55e',
              }}
            />
          </div>
        </div>

        {/* Add Block to nearest free slot */}
        {onAddBlock && (
          <button
            onClick={() =>
              handleAddNewBlockWithFreeSlot({
                headline: 'नया समाचार शीर्षक',
                body: 'समाचार का विवरण यहाँ दर्ज करें...',
              })
            }
            data-testid="free-layout-add-block-btn"
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#334155',
              padding: '3px 8px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
            title="निकटतम खाली स्थान पर ब्लॉक जोड़ें"
          >
            + ब्लॉक
          </button>
        )}

        {/* Layout Mode Switcher */}
        {onToggleLayoutMode && (
          <button
            onClick={() => onToggleLayoutMode('auto')}
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#334155',
              padding: '3px 10px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
            title="ऑटो-फ्लो लेआउट में वापस बदलें"
          >
            <span>📐 मुक्त (Free)</span>
            <span style={{ color: '#94a3b8', fontSize: '9px' }}>⇄ ऑटो</span>
          </button>
        )}
      </div>

      {/* Status Message Notification Toast */}
      {statusMessage && (
        <div
          data-testid="free-layout-toast"
          style={{
            position: 'absolute',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 100,
            backgroundColor: statusMessage.includes('bhar gaya') ? '#991b1b' : '#1e293b',
            color: '#ffffff',
            padding: '8px 16px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 600,
            boxShadow: '0 6px 16px rgba(0,0,0,0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            pointerEvents: 'auto',
          }}
        >
          <span>{statusMessage}</span>
          {statusMessage.includes('bhar gaya') && onAddPage && (
            <button
              onClick={onAddPage}
              style={{
                backgroundColor: '#ffffff',
                color: '#991b1b',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '3px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              + नया पेज जोड़ें
            </button>
          )}
        </div>
      )}

      {/* ==========================================================
       * 2. SNAPPING GUIDES OVERLAY (SVG)
       * ========================================================== */}
      {activeGuides.length > 0 && (
        <svg
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 40,
          }}
        >
          {activeGuides.map((guide, idx) => {
            if (guide.type === 'x') {
              return (
                <g key={`x-${idx}`}>
                  <line
                    x1={`${guide.positionMm}mm`}
                    y1="0"
                    x2={`${guide.positionMm}mm`}
                    y2="100%"
                    stroke="#ec4899"
                    strokeWidth="1.2"
                    strokeDasharray="4 2"
                  />
                  {guide.label && (
                    <text
                      x={`${guide.positionMm}mm`}
                      y="16"
                      fill="#be185d"
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {guide.label}
                    </text>
                  )}
                </g>
              );
            }
            return (
              <g key={`y-${idx}`}>
                <line
                  x1="0"
                  y1={`${guide.positionMm}mm`}
                  x2="100%"
                  y2={`${guide.positionMm}mm`}
                  stroke="#ec4899"
                  strokeWidth="1.2"
                  strokeDasharray="4 2"
                />
                {guide.label && (
                  <text
                    x="20"
                    y={`${guide.positionMm - 2}mm`}
                    fill="#be185d"
                    fontSize="9"
                    fontWeight="bold"
                  >
                    {guide.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      )}

      {/* ==========================================================
       * 3. FREE-POSITIONED ARTICLE BLOCKS
       * ========================================================== */}
      {page.articles.map((art) => {
        const isDraggingThis = dragState?.articleId === art.id;
        const frame = isDraggingThis ? dragState.currentFrame : (art.frame ?? { x: bounds.minX, y: bounds.minY, w: 80, h: 50, z: 1 });
        const isSelected = selectedArticleId === art.id;
        const isOverflowing = overflowingArticles[art.id] ?? false;
        const isSwapSource = swapSourceId === art.id;

        return (
          <div
            key={art.id}
            data-article-id={art.id}
            ref={(el) => {
              if (el) articleRefs.current.set(art.id, el);
              else articleRefs.current.delete(art.id);
            }}
            onPointerDown={(e) => handlePointerDownArticle(e, art)}
            onPointerCancel={handlePointerCancel}
            style={{
              position: 'absolute',
              left: `${frame.x}mm`,
              top: `${frame.y}mm`,
              width: `${frame.w}mm`,
              height: `${frame.h}mm`,
              zIndex: isDraggingThis ? 999 : isSelected ? 30 : (frame.z ?? 1),
              pointerEvents: 'auto',
              cursor: isTapToSwapActive ? 'crosshair' : isDraggingThis ? 'grabbing' : 'grab',
              overflow: 'hidden',
              boxSizing: 'border-box',
              outline: isSelected
                ? '2px solid #2563eb'
                : isSwapSource
                ? '2px dashed #9333ea'
                : '1px solid transparent',
              outlineOffset: '2px',
              boxShadow: isDraggingThis
                ? '0 12px 28px rgba(0,0,0,0.22)'
                : isSelected
                ? '0 4px 12px rgba(37,99,235,0.18)'
                : 'none',
              backgroundColor: art.backgroundColor || '#ffffff',
              transition: isDraggingThis ? 'none' : 'box-shadow 0.15s ease',
            }}
          >
            {/* Render Internal Article Body / Typography */}
            {renderArticleContent(art, isSelected)}

            {/* Overflow Marker (Task 4) */}
            {isOverflowing && (
              <div
                data-testid={`overflow-marker-${art.id}`}
                style={{
                  position: 'absolute',
                  bottom: '2px',
                  right: '2px',
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  fontSize: '9px',
                  fontWeight: 700,
                  padding: '1px 4px',
                  borderRadius: '2px',
                  zIndex: 25,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                  pointerEvents: 'none',
                }}
                title="सामग्री सीमा से बाहर है (Text Kat Raha Hai)"
              >
                ⚠️ text kat raha hai
              </div>
            )}

            {/* Swap Candidate Indicator */}
            {isSwapSource && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'rgba(147, 51, 234, 0.15)',
                  border: '2px dashed #9333ea',
                  pointerEvents: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#7e22ce',
                  fontWeight: 800,
                  fontSize: '12px',
                }}
              >
                🔄 बदलने के लिए दूसरा ब्लॉक चुनें (Tap Target)
              </div>
            )}
          </div>
        );
      })}

      {/* ==========================================================
       * 4. SELECTED ARTICLE OVERLAY: 8 RESIZE HANDLES & FLOATING TOOLBAR
       * ========================================================== */}
      {selectedArticle && selectedArticle.frame && (
        <div
          style={{
            position: 'absolute',
            left: `${dragState?.articleId === selectedArticle.id ? dragState.currentFrame.x : selectedArticle.frame.x}mm`,
            top: `${dragState?.articleId === selectedArticle.id ? dragState.currentFrame.y : selectedArticle.frame.y}mm`,
            width: `${dragState?.articleId === selectedArticle.id ? dragState.currentFrame.w : selectedArticle.frame.w}mm`,
            height: `${dragState?.articleId === selectedArticle.id ? dragState.currentFrame.h : selectedArticle.frame.h}mm`,
            pointerEvents: 'none',
            zIndex: 35,
          }}
        >
          {/* 8-Point Resize Handles (44px min touch target) */}
          {(['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'] as ResizeDirection[]).map((dir) => {
            let top = '50%';
            let left = '50%';
            let cursor = 'default';

            if (dir === 'nw') { top = '0%'; left = '0%'; cursor = 'nwse-resize'; }
            if (dir === 'n')  { top = '0%'; left = '50%'; cursor = 'ns-resize'; }
            if (dir === 'ne') { top = '0%'; left = '100%'; cursor = 'nesw-resize'; }
            if (dir === 'e')  { top = '50%'; left = '100%'; cursor = 'ew-resize'; }
            if (dir === 'se') { top = '100%'; left = '100%'; cursor = 'nwse-resize'; }
            if (dir === 's')  { top = '100%'; left = '50%'; cursor = 'ns-resize'; }
            if (dir === 'sw') { top = '100%'; left = '0%'; cursor = 'nesw-resize'; }
            if (dir === 'w')  { top = '50%'; left = '0%'; cursor = 'ew-resize'; }

            return (
              <div
                key={dir}
                data-testid={`handle-${dir}`}
                onPointerDown={(e) => handlePointerDownResize(e, selectedArticle, dir)}
                style={{
                  position: 'absolute',
                  top,
                  left,
                  transform: 'translate(-50%, -50%)',
                  width: '44px',
                  height: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'auto',
                  cursor,
                  zIndex: 40,
                }}
              >
                <div
                  style={{
                    width: '10px',
                    height: '10px',
                    backgroundColor: '#ffffff',
                    border: '2px solid #2563eb',
                    borderRadius: dir.length === 2 ? '1px' : '9999px',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
                  }}
                />
              </div>
            );
          })}

          {/* Floating Action Toolbar: Nudge & Swap Buttons */}
          <div
            data-testid="floating-nudge-toolbar"
            style={{
              position: 'absolute',
              top: '-36px',
              left: '0',
              backgroundColor: '#1e293b',
              borderRadius: '6px',
              padding: '3px 6px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              pointerEvents: 'auto',
              boxShadow: '0 4px 10px rgba(0,0,0,0.25)',
              zIndex: 50,
            }}
          >
            {/* Position Nudge D-pad */}
            <button
              onClick={() => handleNudge(0, -4)}
              title="ऊपर खिसकाएँ (Up 4mm)"
              style={nudgeBtnStyle}
            >
              ⬆️
            </button>
            <button
              onClick={() => handleNudge(0, 4)}
              title="नीचे खिसकाएँ (Down 4mm)"
              style={nudgeBtnStyle}
            >
              ⬇️
            </button>
            <button
              onClick={() => handleNudge(-4, 0)}
              title="बाएँ खिसकाएँ (Left 4mm)"
              style={nudgeBtnStyle}
            >
              ⬅️
            </button>
            <button
              onClick={() => handleNudge(4, 0)}
              title="दाएँ खिसकाएँ (Right 4mm)"
              style={nudgeBtnStyle}
            >
              ➡️
            </button>

            <div style={{ width: '1px', height: '14px', backgroundColor: '#475569' }} />

            {/* Dimension Nudge */}
            <button
              onClick={() => handleNudge(0, 0, 4, 0)}
              title="चौड़ा करें (Wider +4mm)"
              style={nudgeBtnStyle}
            >
              ↔️+
            </button>
            <button
              onClick={() => handleNudge(0, 0, -4, 0)}
              title="सकरा करें (Narrower -4mm)"
              style={nudgeBtnStyle}
            >
              ↔️-
            </button>
            <button
              onClick={() => handleNudge(0, 0, 0, 4)}
              title="लंबा करें (Taller +4mm)"
              style={nudgeBtnStyle}
            >
              ↕️+
            </button>
            <button
              onClick={() => handleNudge(0, 0, 0, -4)}
              title="छोटा करें (Shorter -4mm)"
              style={nudgeBtnStyle}
            >
              ↕️-
            </button>

            <div style={{ width: '1px', height: '14px', backgroundColor: '#475569' }} />

            {/* Tap-to-Swap Mode Trigger */}
            <button
              onClick={() => {
                setIsTapToSwapActive(true);
                setSwapSourceId(selectedArticle.id);
                showToast('अब उस ब्लॉक पर क्लिक करें जिसे बदलना है (Tap destination block)');
              }}
              title="अन्य ब्लॉक से स्थिति बदलें (Swap Positions)"
              style={{
                ...nudgeBtnStyle,
                color: isTapToSwapActive ? '#facc15' : '#ffffff',
                backgroundColor: isTapToSwapActive ? '#854d0e' : '#334155',
                padding: '2px 6px',
                fontSize: '11px',
              }}
            >
              🔄 Swap
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const nudgeBtnStyle: React.CSSProperties = {
  backgroundColor: '#334155',
  color: '#ffffff',
  border: 'none',
  borderRadius: '3px',
  padding: '2px 5px',
  fontSize: '11px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};
