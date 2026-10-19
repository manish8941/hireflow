import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useCloudeeEnabled } from './cloudeeStorage';
import { cloudeeBus, cloudeeEmit } from './cloudeeEvents';
import { CloudeeEventPayload } from './cloudee.types';
import {
  mapEventToReaction,
  DEFAULT_CLOUDEE_STATE,
  CloudeeControllerState,
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

  const revertTimerRef = useRef<number | null>(null);
  const bubbleTimerRef = useRef<number | null>(null);

  const { activeTab, setActiveTab, setIsAddModalOpen } = useATS();

  // If enabled is toggled OFF while helper panel is open, close the panel immediately
  useEffect(() => {
    if (!enabled) {
      setIsHelperOpen(false);
      setTransientBubble(null);
      if (revertTimerRef.current) window.clearTimeout(revertTimerRef.current);
      if (bubbleTimerRef.current) window.clearTimeout(bubbleTimerRef.current);
    } else {
      // Restore default neutral state when turned back ON
      setCurrentExpression('neutral');
    }
  }, [enabled]);

  // Subscribe to Cloudee Event Bus when enabled
  useEffect(() => {
    if (!enabled) return;

    const unsubscribe = cloudeeBus.subscribe((payload: CloudeeEventPayload) => {
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
        }, 3400);
      }

      // If transient event, schedule revert to contextual route idle/listening state
      if (nextState.transient) {
        if (revertTimerRef.current) window.clearTimeout(revertTimerRef.current);
        revertTimerRef.current = window.setTimeout(() => {
          const routeState = mapEventToReaction(
            { type: activeTab === 'candidates' ? 'ROUTE_CANDIDATES' : 'ROUTE_DASHBOARD' },
            activeTab
          );
          setControllerState(routeState);
          setCurrentExpression(routeState.expression);
        }, 2800);
      }
    });

    return () => {
      unsubscribe();
      if (revertTimerRef.current) window.clearTimeout(revertTimerRef.current);
      if (bubbleTimerRef.current) window.clearTimeout(bubbleTimerRef.current);
    };
  }, [enabled, activeTab]);

  // Handle Route changes automatically
  useEffect(() => {
    if (!enabled) return;
    let eventType: CloudeeEventPayload['type'] = 'ROUTE_DASHBOARD';
    if (activeTab === 'candidates') eventType = 'ROUTE_CANDIDATES';
    else if (activeTab === 'pipeline') eventType = 'ROUTE_PIPELINE';
    else if (activeTab === 'settings') eventType = 'ROUTE_SETTINGS';

    cloudeeEmit(eventType);
  }, [activeTab, enabled]);

  // Mascot Click: triggers cute reaction (happy/excited), opens helper panel
  const handleMascotClick = useCallback(() => {
    if (!enabled) return;

    setCurrentExpression('happy');
    cloudeeEmit('MASCOT_CLICK');
    setIsHelperOpen((prev) => !prev);

    // Auto-revert click reaction after short delay if panel closed
    if (revertTimerRef.current) window.clearTimeout(revertTimerRef.current);
    revertTimerRef.current = window.setTimeout(() => {
      setCurrentExpression(isHelperOpen ? 'listening' : 'neutral');
    }, 2000);
  }, [enabled, isHelperOpen]);

  // Mascot Hover: gentle curious reaction
  const handleMouseEnter = useCallback(() => {
    if (!enabled || isHelperOpen) return;
    setCurrentExpression('curious');
  }, [enabled, isHelperOpen]);

  const handleMouseLeave = useCallback(() => {
    if (!enabled || isHelperOpen) return;
    setCurrentExpression(controllerState.expression);
  }, [enabled, isHelperOpen, controllerState.expression]);

  // If Cloudee is disabled, render unobtrusive collapsed toggle button to re-enable
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
        <div className="cloudee-transient-bubble animate-pop-in">
          <span>{transientBubble}</span>
        </div>
      )}

      {/* Helper Panel anchored above mascot */}
      <CloudeeHelperPanel
        isOpen={isHelperOpen}
        onClose={() => {
          setIsHelperOpen(false);
          setCurrentExpression('neutral');
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
        }}
        onOpenAddCandidate={() => {
          setIsAddModalOpen(true);
          setIsHelperOpen(false);
        }}
        onFocusSearch={() => {
          const input = document.querySelector<HTMLInputElement>('.topbar-search-input');
          if (input) {
            input.focus();
          }
          setIsHelperOpen(false);
        }}
      />

      {/* Mascot Button Surface */}
      <div className="cloudee-mascot-anchor">
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
          <div className="cloudee-vector-wrapper">
            <MascotFace
              expression={currentExpression}
              size={82}
              ariaLabel={`HireFlow Mascot in ${currentExpression} state`}
            />
          </div>
          <div className="cloudee-mascot-halo" />
        </button>
      </div>
    </div>
  );
};
