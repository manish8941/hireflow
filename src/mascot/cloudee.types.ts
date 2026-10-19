export interface CloudeeSphereNode {
  surface: {
    type: string;
    width: number;
    height: number;
    depth: number;
    roundness: number;
    morphRoundness?: number;
  };
  position: [number, number, number];
  rotation: [number, number, number];
}

export interface CloudeeBody {
  primary: {
    type: string;
    width: number;
    height: number;
    depth: number;
    roundness: number;
  };
  nodes: CloudeeSphereNode[];
}

export interface CloudeeEyeState {
  width: number;
  height: number;
  x: number;
  y: number;
  angle: number;
}

export interface CloudeeExpression {
  head: {
    x: number;
    y: number;
    z: number;
  };
  eyes: {
    left: CloudeeEyeState;
    right: CloudeeEyeState;
    spacing: number;
  };
  perspective: number;
  motion: {
    eyes: 'none' | 'shake';
    body: 'none' | 'shake' | 'slowDrift';
  };
  colors?: {
    body?: string;
    eyes?: string;
  };
}

export interface CloudeeAnimationStep {
  expression: CloudeeExpressionKey;
  holdMs: number;
  transitionMs: number;
  transition: 'smooth' | 'instant';
}

export interface CloudeeBlinkConfig {
  enabled: boolean;
  initialDelayMs: number;
  minIntervalMs: number;
  maxIntervalMs: number;
  durationMs: number;
}

export interface CloudeeAnimation {
  playbackMode: 'loop' | 'once';
  steps: CloudeeAnimationStep[];
  blink: CloudeeBlinkConfig;
  metadata?: {
    label: string;
    description: string;
    group: string;
  };
}

export interface CloudeeAvatarDefinition {
  schema: string;
  schemaVersion: number;
  name: string;
  body: CloudeeBody;
  colors: {
    body: string;
    eyes: string;
  };
  expressions: Record<CloudeeExpressionKey, CloudeeExpression>;
  expressionOrder: CloudeeExpressionKey[];
  animations: Record<CloudeeAnimationKey, CloudeeAnimation>;
  animationOrder: CloudeeAnimationKey[];
}

export type CloudeeExpressionKey =
  | 'neutral'
  | 'upward-side-glance'
  | 'downward-gaze'
  | 'skeptical-right'
  | 'small-attentive'
  | 'wide-downward-gaze'
  | 'surprised-left'
  | 'sleepy-squint'
  | 'angry-right'
  | 'curious-left'
  | 'asymmetric-down-right'
  | 'attentive-left'
  | 'joyful-wide'
  | 'eyes-closed'
  | 'joyful-down-right'
  | 'skeptical-left'
  | 'far-right-glance'
  | 'angry-left'
  | 'playful-right'
  | 'asymmetric-up-left'
  | 'gentle-downward-gaze'
  | 'wide-down-left'
  | 'surprised-wide-left'
  | 'drowsy-closed'
  | 'suspicious-right'
  | 'shy-downward'
  | 'angry-brows'
  | 'uneasy-left';

export type CloudeeAnimationKey =
  | 'sleeping'
  | 'waking'
  | 'idle'
  | 'listening'
  | 'thinking'
  | 'searching'
  | 'working'
  | 'excited'
  | 'bored'
  | 'suspicious'
  | 'angry'
  | 'drowsy'
  | 'happy'
  | 'curious'
  | 'confused'
  | 'surprised'
  | 'proud'
  | 'shy'
  | 'sad'
  | 'laughing'
  | 'scared'
  | 'playful'
  | 'celebrate';

export type CloudeeEventType =
  | 'APP_LOAD'
  | 'MASCOT_HOVER'
  | 'MASCOT_CLICK'
  | 'ROUTE_DASHBOARD'
  | 'ROUTE_CANDIDATES'
  | 'ROUTE_PIPELINE'
  | 'ROUTE_SETTINGS'
  | 'SEARCH_TYPING'
  | 'SEARCH_RESULTS'
  | 'SEARCH_EMPTY'
  | 'CANDIDATE_VIEW'
  | 'CANDIDATE_ADD_START'
  | 'CANDIDATE_ADD_SUCCESS'
  | 'CANDIDATE_ADD_FAIL'
  | 'CANDIDATE_UPDATE_SUCCESS'
  | 'CANDIDATE_DELETE_SUCCESS'
  | 'CANDIDATE_STAGE_CHANGE'
  | 'THEME_CHANGE'
  | 'IDLE_TIMEOUT';

export interface CloudeeEventPayload {
  type: CloudeeEventType;
  message?: string;
  data?: Record<string, unknown>;
  timestamp?: number;
}

export interface CloudeeQuickAction {
  id: string;
  label: string;
  icon?: string;
  action: () => void;
}
