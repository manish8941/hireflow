import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

export const MonochromeLiquidCanvas: React.FC = () => {
  const { isDark } = useTheme();
  const [effectiveDark, setEffectiveDark] = useState(() => {
    const attr = typeof document !== 'undefined' ? document.documentElement.getAttribute('data-theme') : null;
    return attr ? attr !== 'light' : isDark;
  });

  useEffect(() => {
    setEffectiveDark(isDark);
  }, [isDark]);

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === 'attributes' && m.attributeName === 'data-theme') {
          const attr = document.documentElement.getAttribute('data-theme');
          setEffectiveDark(attr !== 'light');
        }
      }
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  const svgRef = useRef<SVGSVGElement | null>(null);

  // Groups for parallax & lighting movement
  const bloomGroupRef = useRef<SVGGElement | null>(null);
  const shadowGroupRef = useRef<SVGGElement | null>(null);
  const highlightGroupRef = useRef<SVGGElement | null>(null);
  const ridgeGroupRef = useRef<SVGGElement | null>(null);
  const montereyRef = useRef<HTMLDivElement | null>(null);

  // Fallback state if SVG rendering issues occur
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let prefersReducedMotion = mediaQuery.matches;
    const handleMotionChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion = e.matches;
    };
    mediaQuery.addEventListener('change', handleMotionChange);

    // Pointer tracking with strong easing (lerp)
    let targetX = 0;
    let targetY = 0;
    let curX = 0;
    let curY = 0;

    const handlePointerMove = (e: MouseEvent) => {
      if (prefersReducedMotion) return;
      const normX = (e.clientX / window.innerWidth - 0.5) * 2; // -1 to +1
      const normY = (e.clientY / window.innerHeight - 0.5) * 2; // -1 to +1
      targetX = normX;
      targetY = normY;
    };

    const handlePointerLeave = () => {
      targetX = 0;
      targetY = 0;
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    document.addEventListener('mouseleave', handlePointerLeave);

    // Visibility management
    let isVisible = true;
    const handleVisibility = () => {
      isVisible = document.visibilityState === 'visible';
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // Animation Loop
    let animId: number;
    const startTime = performance.now();

    const render = (now: number) => {
      animId = requestAnimationFrame(render);
      if (!isVisible) return;

      const elapsed = (now - startTime) * 0.001;

      // Smooth pointer easing (strong, luxurious damping)
      curX += (targetX - curX) * 0.016;
      curY += (targetY - curY) * 0.016;

      // Slow, subtle ambient drift (~38 second cycle)
      const ambientX = prefersReducedMotion ? 0 : Math.sin(elapsed * 0.09) * 2.2;
      const ambientY = prefersReducedMotion ? 0 : Math.cos(elapsed * 0.07) * 1.6;

      // Parallax offsets (gentle micro-shifts, ~70% lower intensity)
      const hlX = -2 + curX * 3.4 + ambientX;
      const hlY = -4 + curY * 2.6 + ambientY;

      // Ridge shifts slightly for subtle specular glint
      const ridgeX = -3 + curX * 4.2 + ambientX * 1.1;
      const ridgeY = -5 + curY * 3.2 + ambientY * 1.1;

      // Shadows shift in opposite direction for restrained 3D depth
      const shX = 0 - curX * 2.2 - ambientX * 0.4;
      const shY = (effectiveDark ? 16 : 10) - curY * 1.8 - ambientY * 0.3;

      // Ambient bloom shifts with highlight
      const bloomX = -2 + curX * 3.4 + ambientX;
      const bloomY = -4 + curY * 2.6 + ambientY;

      if (effectiveDark) {
        if (highlightGroupRef.current) {
          highlightGroupRef.current.setAttribute('transform', `translate(${hlX.toFixed(2)}, ${hlY.toFixed(2)})`);
        }
        if (ridgeGroupRef.current) {
          ridgeGroupRef.current.setAttribute('transform', `translate(${ridgeX.toFixed(2)}, ${ridgeY.toFixed(2)})`);
        }
        if (shadowGroupRef.current) {
          shadowGroupRef.current.setAttribute('transform', `translate(${shX.toFixed(2)}, ${shY.toFixed(2)})`);
        }
        if (bloomGroupRef.current) {
          bloomGroupRef.current.setAttribute('transform', `translate(${bloomX.toFixed(2)}, ${bloomY.toFixed(2)})`);
        }
      } else if (montereyRef.current) {
        const montX = curX * 10 + ambientX * 1.5;
        const montY = curY * 8 + ambientY * 1.2;
        montereyRef.current.style.transform = `translate(${montX.toFixed(2)}px, ${montY.toFixed(2)}px)`;
      }
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handlePointerMove);
      document.removeEventListener('mouseleave', handlePointerLeave);
      document.removeEventListener('visibilitychange', handleVisibility);
      mediaQuery.removeEventListener('change', handleMotionChange);
    };
  }, [effectiveDark]);

  if (hasError) {
    return <div className="liquid-ambient-css-fallback" aria-hidden="true" />;
  }

  return (
    <div className={`monochrome-tubes-wrapper ${effectiveDark ? 'theme-dark' : 'theme-light'}`} aria-hidden="true">
      {effectiveDark ? (
        <svg
          ref={svgRef}
          className="monochrome-tubes-svg"
          viewBox="0 0 1600 1000"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
          onError={() => setHasError(true)}
        >
        <defs>
          {/* Soft Ambient Bloom Glow (subtle background aura) */}
          <filter id="tubeAmbientBloom" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="28" />
          </filter>

          {/* Deep Recessed Trench Shadow (Gentle Ambient Occlusion) */}
          <filter id="tubeTrenchShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="20" />
          </filter>

          {/* Close Crevice Shadow */}
          <filter id="tubeCreviceShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" />
          </filter>

          {/* Diffused Top Lighting Blur */}
          <filter id="tubeTopLightBlur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="12" />
          </filter>

          {/* Specular Ridge Blur */}
          <filter id="tubeSpecularRidgeBlur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4.5" />
          </filter>

          {/* Cylindrical Shading Gradients — Subdued Architectural Monochrome */}
          <linearGradient id="liveTubeBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            {effectiveDark ? (
              <>
                <stop offset="0%" stopColor="#1B1D24" />
                <stop offset="30%" stopColor="#14151B" />
                <stop offset="70%" stopColor="#0E0F13" />
                <stop offset="100%" stopColor="#07080A" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#F1F3F7" />
                <stop offset="35%" stopColor="#E5E8F0" />
                <stop offset="70%" stopColor="#D8DCE5" />
                <stop offset="100%" stopColor="#C4C9D5" />
              </>
            )}
          </linearGradient>

          {/* Softened Rim Lighting Gradient (Reduced by ~65% in intensity) */}
          <linearGradient id="liveRimGlowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            {effectiveDark ? (
              <>
                <stop offset="0%" stopColor="#6E7486" stopOpacity="0.45" />
                <stop offset="35%" stopColor="#353945" stopOpacity="0.18" />
                <stop offset="70%" stopColor="#15171E" stopOpacity="0.04" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0.0" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.55" />
                <stop offset="45%" stopColor="#EAEBF2" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#CED3DE" stopOpacity="0.0" />
              </>
            )}
          </linearGradient>

          {/* Softened Specular Ridge Gradient */}
          <linearGradient id="liveSpecularGlowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            {effectiveDark ? (
              <>
                <stop offset="0%" stopColor="#9CA2B4" stopOpacity="0.40" />
                <stop offset="40%" stopColor="#555A68" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#181A22" stopOpacity="0.0" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.50" />
                <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#E2E5EE" stopOpacity="0.0" />
              </>
            )}
          </linearGradient>

          {/* Central Atmospheric Neutral Scrim — Separates foreground ATS cards cleanly */}
          <radialGradient id="centerAtmosphereScrim" cx="50%" cy="42%" r="62%">
            <stop offset="0%" stopColor={effectiveDark ? "#060709" : "#F6F7FA"} stopOpacity="0.82" />
            <stop offset="45%" stopColor={effectiveDark ? "#060709" : "#F6F7FA"} stopOpacity="0.55" />
            <stop offset="80%" stopColor={effectiveDark ? "#060709" : "#F6F7FA"} stopOpacity="0.18" />
            <stop offset="100%" stopColor={effectiveDark ? "#060709" : "#F6F7FA"} stopOpacity="0.0" />
          </radialGradient>
        </defs>

        {/* Base Canvas */}
        <rect width="1600" height="1000" fill={effectiveDark ? '#060709' : '#F6F7FA'} />

        {/* ====================================================================
            SCULPTED DELIBERATE GEOMETRY (Inspired directly by Reference A)
            Uniform stroke width: 120px
            Perfect mathematical arcs with continuous curvature and seamless joins
            ==================================================================== */}
        <g id="liveTubesGeometry" fill="none">
          {/* Main Continuous Serpentine Track */}
          <path
            fill="none"
            d="M 80 1080 L 80 340 A 240 240 0 0 1 320 100 L 1040 100 A 110 110 0 0 1 1040 320 L 520 320 A 115 115 0 0 0 520 550 L 1120 550 A 120 120 0 0 1 1120 790 L 480 790 A 105 105 0 0 0 480 1000 L 1680 1000"
          />

          {/* Left Inner Concentric Corner */}
          <path
            fill="none"
            d="M 280 1080 L 280 520 A 200 200 0 0 1 480 320"
          />

          {/* Right Hairpin Column */}
          <path
            fill="none"
            d="M 1320 1080 L 1320 220 A 115 115 0 0 1 1550 220 L 1550 1080"
          />
        </g>

        {/* ------------------------------------------------------------------
            THEME-SPECIFIC LAYERED CYLINDRICAL 3D LIGHTING (Subdued Atmospheric)
            ------------------------------------------------------------------ */}
        {effectiveDark ? (
          /* DARK THEME: Deep Obsidian, Charcoal, Graphite, Soft Silver Sheen */
          <>
            {/* Layer 0: Ambient Bloom Halo behind upper rims */}
            <g ref={bloomGroupRef} transform="translate(-2, -4)">
              <use
                href="#liveTubesGeometry"
                fill="none"
                stroke="#454B5C"
                strokeWidth="136"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#tubeAmbientBloom)"
                opacity="0.10"
              />
            </g>

            {/* Layer 1: Deep Trench Shadow (Ambient Occlusion) */}
            <g ref={shadowGroupRef} transform="translate(0, 16)">
              <use
                href="#liveTubesGeometry"
                fill="none"
                stroke="#000000"
                strokeWidth="152"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#tubeTrenchShadow)"
                opacity="0.65"
              />
            </g>

            {/* Layer 2: Close Crevice Shadow */}
            <use
              href="#liveTubesGeometry"
              fill="none"
              stroke="#000000"
              strokeWidth="134"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#tubeCreviceShadow)"
              opacity="0.50"
              transform="translate(0, 10)"
            />

            {/* Layer 3: Core Tube Body (Crisp, 120px uniform width) */}
            <use
              href="#liveTubesGeometry"
              fill="none"
              stroke="url(#liveTubeBodyGrad)"
              strokeWidth="120"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Layer 4: Cylindrical Upper Rim Illumination (Soft Studio Light) */}
            <g ref={highlightGroupRef} transform="translate(-2, -4)">
              <use
                href="#liveTubesGeometry"
                fill="none"
                stroke="url(#liveRimGlowGrad)"
                strokeWidth="96"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#tubeTopLightBlur)"
                opacity="0.32"
              />
            </g>

            {/* Layer 5: Soft Specular Ridge Glow & Fine Crest Line */}
            <g ref={ridgeGroupRef} transform="translate(-3, -5)">
              <use
                href="#liveTubesGeometry"
                fill="none"
                stroke="url(#liveSpecularGlowGrad)"
                strokeWidth="24"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#tubeSpecularRidgeBlur)"
                opacity="0.22"
              />
              <use
                href="#liveTubesGeometry"
                fill="none"
                stroke="#A0A6B8"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.18"
              />
            </g>

            {/* Layer 6: Atmospheric Neutral Scrim — keeps central content readable */}
            <rect width="1600" height="1000" fill="url(#centerAtmosphereScrim)" />
          </>
        ) : (
          /* LIGHT THEME: Pristine Off-White, Sculpted Silver-Graphite, Soft Contours */
          <>
            {/* Layer 1: Soft Ambient Trench Shadow */}
            <g ref={shadowGroupRef} transform="translate(0, 14)">
              <use
                href="#liveTubesGeometry"
                fill="none"
                stroke="#A8ACB8"
                strokeWidth="148"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#tubeTrenchShadow)"
                opacity="0.16"
              />
            </g>

            {/* Layer 2: Close Crevice Shadow */}
            <use
              href="#liveTubesGeometry"
              fill="none"
              stroke="#7A8090"
              strokeWidth="130"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#tubeCreviceShadow)"
              opacity="0.10"
              transform="translate(0, 8)"
            />

            {/* Layer 3: Tube Body (Sculpted matte silver-graphite) */}
            <use
              href="#liveTubesGeometry"
              fill="none"
              stroke="url(#liveTubeBodyGrad)"
              strokeWidth="120"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Layer 4: Lower Charcoal Contour Edge (for gentle form definition) */}
            <use
              href="#liveTubesGeometry"
              fill="none"
              stroke="#707684"
              strokeWidth="118"
              strokeLinecap="round"
              strokeLinejoin="round"
              transform="translate(1, 4)"
              opacity="0.06"
            />

            {/* Layer 5: Cylindrical Upper Rim Illumination */}
            <g ref={highlightGroupRef} transform="translate(-2, -4)">
              <use
                href="#liveTubesGeometry"
                fill="none"
                stroke="url(#liveRimGlowGrad)"
                strokeWidth="96"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#tubeTopLightBlur)"
                opacity="0.32"
              />
            </g>

            {/* Layer 6: Specular Ridge Highlight & Crisp Crest Line */}
            <g ref={ridgeGroupRef} transform="translate(-3, -5)">
              <use
                href="#liveTubesGeometry"
                fill="none"
                stroke="url(#liveSpecularGlowGrad)"
                strokeWidth="24"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#tubeSpecularRidgeBlur)"
                opacity="0.24"
              />
              <use
                href="#liveTubesGeometry"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.25"
              />
            </g>

            {/* Layer 7: Atmospheric Neutral Scrim */}
            <rect width="1600" height="1000" fill="url(#centerAtmosphereScrim)" />
          </>
        )}

      </svg>
      ) : (
        <div className="monterey-light-bg-container" ref={montereyRef}>
          <div className="monterey-light-wallpaper" />
          <div className="monterey-light-soft-scrim" />
        </div>
      )}
    </div>
  );
};
