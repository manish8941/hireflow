import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useCloudeeEnabled } from './cloudeeStorage';
import { cloudeeBus, cloudeeEmit } from './cloudeeEvents';
import { CloudeeEventPayload } from './cloudee.types';
import {
  mapEventToReaction,
  DEFAULT_CLOUDEE_STATE,
  CloudeeControllerState,
  getEventPriority,
} from './cloudeeController';
import { MascotFace, MascotExpression } from './MascotFace';
import { CloudeeHelperPanel } from './CloudeeHelperPanel';
import { useATS } from '../context/ATSContext';
import { Sparkles } from 'lucide-react';

export const CloudeeWidget: React.FC = () => {
  const [enabled, setEnabled] = useCloudeeEnabled();
  const [isHelperOpen, setIsHelperOpen] = useState(false);
  const [controllerState, setControllerState] = useState<CloudeeControllerState>(DEFAULT_CLOUDEE_STATE);
  const [currentExpression, setCurrentExpression] = useState<MascotExpression>('neutral');
  const [transientBubble, setTransientBubble] = useState<string | null>(null);
  const [isBlinking, setIsBlinking] = useState(false);
  const [isBouncing, setIsBouncing] = useState(false);

  // Animation & Transition references
  const anchorRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const revertTimerRef = useRef<number | null>(null);
  const bubbleTimerRef = useRef<number | null>(null);
  const bounceTimerRef = useRef<number | null>(null);
  const blinkCycleRef = useRef<number | null>(null);
  const blinkTimeoutRef = useRef<number | null>(null);
  const doubleBlinkRef = useRef<number | null>(null);

  // Priority tracking: 5 = Error, 4 = Persistent/Listening, 3 = Direct user, 2 = Contextual ATS, 1 = Baseline Idle
  const currentPriorityRef = useRef<number>(1);

  const { activeTab, setActiveTab, setIsAddModalOpen } = useATS();

  // Helper to trigger squash-and-stretch bounce on click/tap
  const triggerCuteBounce = useCallback(() => {
    setIsBouncing(true);
    if (bounceTimerRef.current) window.clearTimeout(bounceTimerRef.current);
    bounceTimerRef.current = window.setTimeout(() => {
      setIsBouncing(false);
    }, 520);
  }, []);

  // Clear all pending timers cleanly
  const clearAllTimers = useCallback(() => {
    if (revertTimerRef.current) window.clearTimeout(revertTimerRef.current);
    if (bubbleTimerRef.current) window.clearTimeout(bubbleTimerRef.current);
    if (bounceTimerRef.current) window.clearTimeout(bounceTimerRef.current);
    if (blinkCycleRef.current) window.clearTimeout(blinkCycleRef.current);
    if (blinkTimeoutRef.current) window.clearTimeout(blinkTimeoutRef.current);
    if (doubleBlinkRef.current) window.clearTimeout(doubleBlinkRef.current);
    if (rafRef.current) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  // When enabled is toggled OFF: immediately halt all animation, timers, panel, and cursor tracking
  useEffect(() => {
    if (!enabled) {
      setIsHelperOpen(false);
      setTransientBubble(null);
      setIsBlinking(false);
      setIsBouncing(false);
      clearAllTimers();
      currentPriorityRef.current = 1;
      if (anchorRef.current) {
        anchorRef.current.style.setProperty('--eye-glance-x', '0px');
        anchorRef.current.style.setProperty('--eye-glance-y', '0px');
      }
    } else {
      // Restore default neutral baseline when turned back ON
      currentPriorityRef.current = 1;
      setCurrentExpression('neutral');
    }
  }, [enabled, clearAllTimers]);

  // Natural Irregular Blinking Loop (fires every 3.2s - 6.0s with 16% double-blink chance)
  useEffect(() => {
    if (!enabled) return;

    let isMounted = true;

    const scheduleNextBlink = () => {
      if (!isMounted) return;
      const interval = Math.floor(Math.random() * 2800) + 3200;

      blinkCycleRef.current = window.setTimeout(() => {
        if (!isMounted) return;
        setIsBlinking(true);

        blinkTimeoutRef.current = window.setTimeout(() => {
          if (!isMounted) return;
          setIsBlinking(false);

          // 16% probability of natural cute double-blink
          if (Math.random() < 0.16) {
            doubleBlinkRef.current = window.setTimeout(() => {
              if (!isMounted) return;
              setIsBlinking(true);
              blinkTimeoutRef.current = window.setTimeout(() => {
                if (!isMounted) return;
                setIsBlinking(false);
                scheduleNextBlink();
              }, 80);
            }, 120);
          } else {
            scheduleNextBlink();
          }
        }, 90);
      }, interval);
    };

    scheduleNextBlink();

    return () => {
      isMounted = false;
      if (blinkCycleRef.current) window.clearTimeout(blinkCycleRef.current);
      if (blinkTimeoutRef.current) window.clearTimeout(blinkTimeoutRef.current);
      if (doubleBlinkRef.current) window.clearTimeout(doubleBlinkRef.current);
    };
  }, [enabled]);

  // Cursor Proximity Awareness & Clamped Eye Glance (throttled via rAF, zero React re-renders)
  useEffect(() => {
    if (!enabled) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (rafRef.current) return;
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null;
        if (!anchorRef.current) return;

        const rect = anchorRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const deltaX = e.clientX - centerX;
        const deltaY = e.clientY - centerY;
        const distance = Math.hypot(deltaX, deltaY);

        const maxGlanceX = 4.5;
        const maxGlanceY = 3.5;
        const glanceRadius = 420;

        if (distance < glanceRadius && distance > 6) {
          // Smooth non-linear falloff factor
          const factor = Math.min(1, Math.max(0, 1 - distance / glanceRadius));
          const normalizedX = deltaX / distance;
          const normalizedY = deltaY / distance;

          const glanceX = normalizedX * maxGlanceX * factor;
          const glanceY = normalizedY * maxGlanceY * factor;

          anchorRef.current.style.setProperty('--eye-glance-x', `${glanceX.toFixed(2)}px`);
          anchorRef.current.style.setProperty('--eye-glance-y', `${glanceY.toFixed(2)}px`);
        } else {
          anchorRef.current.style.setProperty('--eye-glance-x', '0px');
          anchorRef.current.style.setProperty('--eye-glance-y', '0px');
        }
      });
    };

    const handleMouseLeave = () => {
      if (anchorRef.current) {
        anchorRef.current.style.setProperty('--eye-glance-x', '0px');
        anchorRef.current.style.setProperty('--eye-glance-y', '0px');
      }
    };

    const anchorEl = anchorRef.current;

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (anchorEl) {
        anchorEl.style.setProperty('--eye-glance-x', '0px');
        anchorEl.style.setProperty('--eye-glance-y', '0px');
      }
    };
  }, [enabled]);

  // Subscribe to Cloudee Event Bus with Priority Control
  useEffect(() => {
    if (!enabled) return;

    const unsubscribe = cloudeeBus.subscribe((payload: CloudeeEventPayload) => {
      const eventPriority = getEventPriority(payload.type);

      // Higher-priority events override lower ones; lower priority cannot interrupt active higher state
      if (eventPriority < currentPriorityRef.current) {
        return;
      }

      currentPriorityRef.current = eventPriority;
      const nextState = mapEventToReaction(payload, activeTab);
      setControllerState(nextState);
      setCurrentExpression(nextState.expression);

      // Show transient speech bubble on notable actions
      if (
        nextState.transient &&
        payload.type !== 'MASCOT_HOVER' &&
        payload.type !== 'SEARCH_TYPING'
      ) {
        setTransientBubble(nextState.message);
        if (bubbleTimerRef.current) window.clearTimeout(bubbleTimerRef.current);
        bubbleTimerRef.current = window.setTimeout(() => {
          setTransientBubble(null);
        }, 3200);
      }

      // If transient event, schedule return to baseline state
      if (nextState.transient) {
        if (revertTimerRef.current) window.clearTimeout(revertTimerRef.current);
        const revertDuration = eventPriority === 5 ? 3800 : eventPriority === 3 ? 2000 : 2800;

        revertTimerRef.current = window.setTimeout(() => {
          if (isHelperOpen) {
            currentPriorityRef.current = 4;
            setCurrentExpression('listening');
          } else {
            currentPriorityRef.current = 1;
            const routeState = mapEventToReaction(
              { type: activeTab === 'candidates' ? 'ROUTE_CANDIDATES' : 'ROUTE_DASHBOARD' },
              activeTab
            );
            setControllerState(routeState);
            setCurrentExpression(routeState.expression);
          }
        }, revertDuration);
      }
    });

    return () => {
      unsubscribe();
      if (revertTimerRef.current) window.clearTimeout(revertTimerRef.current);
      if (bubbleTimerRef.current) window.clearTimeout(bubbleTimerRef.current);
    };
  }, [enabled, activeTab, isHelperOpen]);

  // Handle Route changes automatically (Priority 1)
  useEffect(() => {
    if (!enabled) return;
    let eventType: CloudeeEventPayload['type'] = 'ROUTE_DASHBOARD';
    if (activeTab === 'candidates') eventType = 'ROUTE_CANDIDATES';
    else if (activeTab === 'pipeline') eventType = 'ROUTE_PIPELINE';
    else if (activeTab === 'settings') eventType = 'ROUTE_SETTINGS';

    cloudeeEmit(eventType);
  }, [activeTab, enabled]);

  // Mascot Click: triggers cute squash-and-stretch bounce, happy/excited expression, opens/closes helper panel
  const handleMascotClick = useCallback(() => {
    if (!enabled) return;

    triggerCuteBounce();
    cloudeeEmit('MASCOT_CLICK');

    if (!isHelperOpen) {
      // Opening assistant panel
      setIsHelperOpen(true);
      currentPriorityRef.current = 3;
      setCurrentExpression('happy');

      if (revertTimerRef.current) window.clearTimeout(revertTimerRef.current);
      revertTimerRef.current = window.setTimeout(() => {
        // Settle into persistent listening mode while panel remains open
        currentPriorityRef.current = 4;
        setCurrentExpression('listening');
      }, 900);
    } else {
      // Closing assistant panel
      setIsHelperOpen(false);
      currentPriorityRef.current = 1;
      setCurrentExpression('neutral');
    }
  }, [enabled, isHelperOpen, triggerCuteBounce]);

  // Mascot Hover: gentle curious reaction (Priority 3)
  const handleMouseEnter = useCallback(() => {
    if (!enabled || isHelperOpen || currentPriorityRef.current > 3) return;
    currentPriorityRef.current = 3;
    setCurrentExpression('curious');
  }, [enabled, isHelperOpen]);

  const handleMouseLeave = useCallback(() => {
    if (!enabled || isHelperOpen) return;
    if (currentPriorityRef.current === 3) {
      currentPriorityRef.current = 1;
      setCurrentExpression(controllerState.expression || 'neutral');
    }
  }, [enabled, isHelperOpen, controllerState.expression]);

  // If Cloudee is disabled, render accessible collapsed toggle button to re-enable
  if (!enabled) {
    return (
      <div className="cloudee-collapsed-container">
        <button
          type="button"
          className="cloudee-collapsed-pill"
          onClick={() => setEnabled(true)}
          aria-label="Cloudee Mascot is Off. Click to enable Cloudee AI Companion."
          title="Enable Cloudee AI Companion"
        >
          <Sparkles size={12} className="cloudee-collapsed-icon" />
          <span className="cloudee-collapsed-text">Mascot Off</span>
        </button>
      </div>
    );
  }

  return (
    <div className="cloudee-floating-widget-root" aria-live="polite">
      {/* Transient Speech Bubble on important actions */}
      {transientBubble && !isHelperOpen && (
        <div className="cloudee-transient-bubble animate-pop-in" role="status">
          <span>{transientBubble}</span>
        </div>
      )}

      {/* Helper Panel anchored above mascot */}
      <CloudeeHelperPanel
        isOpen={isHelperOpen}
        onClose={() => {
          setIsHelperOpen(false);
          currentPriorityRef.current = 1;
          setCurrentExpression('neutral');
          triggerCuteBounce();
        }}
        message={controllerState.message}
        subMessage={controllerState.subMessage}
        enabled={enabled}
        onToggleEnabled={(nextVal) => {
          setEnabled(nextVal);
          if (!nextVal) setIsHelperOpen(false);
        }}
        activeTab={activeTab}
        onNavigate={(tab) => {
          setActiveTab(tab);
          setIsHelperOpen(false);
          currentPriorityRef.current = 1;
        }}
        onOpenAddCandidate={() => {
          setIsAddModalOpen(true);
          setIsHelperOpen(false);
          currentPriorityRef.current = 2;
        }}
        onFocusSearch={() => {
          const input = document.querySelector<HTMLInputElement>('.topbar-search-input');
          if (input) {
            input.focus();
          }
          setIsHelperOpen(false);
        }}
      />

      {/* Mascot Button Surface with Anchor for Eye Glance Coordinates */}
      <div className="cloudee-mascot-anchor" ref={anchorRef}>
        <button
          type="button"
          className={`cloudee-mascot-btn ${isHelperOpen ? 'is-active' : ''}`}
          onClick={handleMascotClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          aria-label="HireFlow AI Companion (Click to open helper actions)"
          aria-expanded={isHelperOpen}
          aria-haspopup="dialog"
        >
          <div className={`cloudee-vector-wrapper ${isBouncing ? 'is-bouncing' : 'is-idle'}`}>
            <MascotFace
              expression={currentExpression}
              size={82}
              isBlinking={isBlinking}
              ariaLabel={`HireFlow Mascot in ${currentExpression} state`}
            />
          </div>
          <div className={`cloudee-mascot-halo ${isBouncing ? '' : 'is-idle'}`} />
        </button>
      </div>
    </div>
  );
};

