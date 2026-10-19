import {
  CloudeeAnimationKey,
  CloudeeExpressionKey,
  CloudeeEventPayload,
  CloudeeEventType,
} from './cloudee.types';
import { MascotExpression } from './MascotFace';

export interface CloudeeControllerState {
  expression: MascotExpression;
  animation: CloudeeAnimationKey;
  expressionOverride: CloudeeExpressionKey | null;
  message: string;
  subMessage?: string;
  lastEventType: CloudeeEventType;
  transient: boolean;
}

export const DEFAULT_CLOUDEE_STATE: CloudeeControllerState = {
  expression: 'neutral',
  animation: 'idle',
  expressionOverride: null,
  message: 'Hey! Ready to find your next great hire?',
  subMessage: 'I am Cloudee, your intelligent hiring companion.',
  lastEventType: 'APP_LOAD',
  transient: false,
};

export const EVENT_PRIORITY: Record<CloudeeEventType, number> = {
  DATABASE_ERROR: 5,           // Highest: critical errors
  CANDIDATE_ADD_FAIL: 5,       // Highest: critical validation/submit error
  MASCOT_CLICK: 3,             // Direct user interaction
  MASCOT_HOVER: 3,             // Direct pointer hover
  DATA_LOADING: 2,             // Operational state
  CANDIDATE_ADD_SUCCESS: 2,    // Contextual application event
  CANDIDATE_UPDATE_SUCCESS: 2,
  CANDIDATE_DELETE_SUCCESS: 2,
  CANDIDATE_STAGE_CHANGE: 2,
  SEARCH_TYPING: 2,
  SEARCH_RESULTS: 2,
  SEARCH_EMPTY: 2,
  THEME_CHANGE: 2,
  CANDIDATE_VIEW: 2,
  CANDIDATE_ADD_START: 2,
  ROUTE_DASHBOARD: 1,          // Baseline route states
  ROUTE_CANDIDATES: 1,
  ROUTE_PIPELINE: 1,
  ROUTE_SETTINGS: 1,
  APP_LOAD: 1,
  IDLE_TIMEOUT: 1,
};

export const getEventPriority = (type: CloudeeEventType): number => {
  return EVENT_PRIORITY[type] ?? 1;
};

export function mapEventToReaction(
  payload: CloudeeEventPayload,
  currentRoute = 'dashboard'
): CloudeeControllerState {
  switch (payload.type) {
    case 'APP_LOAD':
      return {
        expression: 'neutral',
        animation: 'idle',
        expressionOverride: null,
        message: 'Hey! Ready to find your next great hire?',
        subMessage: 'Click me anytime for quick shortcuts and pipeline insights.',
        lastEventType: 'APP_LOAD',
        transient: false,
      };

    case 'MASCOT_HOVER':
      return {
        expression: 'curious',
        animation: 'curious',
        expressionOverride: 'curious-left',
        message: 'Psst... need a hand?',
        subMessage: 'Click me to view helpful actions or customize my presence.',
        lastEventType: 'MASCOT_HOVER',
        transient: true,
      };

    case 'MASCOT_CLICK':
      return {
        expression: 'happy',
        animation: 'happy',
        expressionOverride: 'joyful-wide',
        message: "You called? I'm here!",
        subMessage: 'Here are some quick shortcuts for where you are.',
        lastEventType: 'MASCOT_CLICK',
        transient: false,
      };

    case 'ROUTE_DASHBOARD':
      return {
        expression: 'neutral',
        animation: 'idle',
        expressionOverride: 'attentive-left',
        message: "Here's how your hiring pipeline is looking.",
        subMessage: 'Review metrics, stage distributions, and recent applicants.',
        lastEventType: 'ROUTE_DASHBOARD',
        transient: false,
      };

    case 'ROUTE_CANDIDATES':
      return {
        expression: 'listening',
        animation: 'listening',
        expressionOverride: 'attentive-left',
        message: "Let's find the right candidate.",
        subMessage: 'Search, filter, or update candidate records in the directory.',
        lastEventType: 'ROUTE_CANDIDATES',
        transient: false,
      };

    case 'ROUTE_PIPELINE':
      return {
        expression: 'thinking',
        animation: 'listening',
        expressionOverride: 'gentle-downward-gaze',
        message: "Let's keep the hiring process moving.",
        subMessage: 'Review candidates by stage and advance them along.',
        lastEventType: 'ROUTE_PIPELINE',
        transient: false,
      };

    case 'ROUTE_SETTINGS':
      return {
        expression: 'curious',
        animation: 'curious',
        expressionOverride: 'curious-left',
        message: 'System preferences and assistant settings.',
        subMessage: 'Configure appearance, data modes, and Cloudee preferences.',
        lastEventType: 'ROUTE_SETTINGS',
        transient: false,
      };

    case 'SEARCH_TYPING':
      return {
        expression: 'thinking',
        animation: 'searching',
        expressionOverride: 'far-right-glance',
        message: "Let's find who you're looking for.",
        subMessage: 'Searching candidates across titles, names, and skills...',
        lastEventType: 'SEARCH_TYPING',
        transient: true,
      };

    case 'SEARCH_RESULTS': {
      const count = typeof payload.data?.count === 'number' ? payload.data.count : 0;
      return {
        expression: count > 0 ? 'happy' : 'neutral',
        animation: 'happy',
        expressionOverride: 'joyful-down-right',
        message: `Found ${count} candidate${count === 1 ? '' : 's'} for you.`,
        subMessage: 'Click any row to open detailed profiles and evaluations.',
        lastEventType: 'SEARCH_RESULTS',
        transient: true,
      };
    }

    case 'SEARCH_EMPTY':
      return {
        expression: 'confused',
        animation: 'confused',
        expressionOverride: 'skeptical-left',
        message: 'No matches yet. Try another search?',
        subMessage: 'You can search by role, skills, tags, or candidate name.',
        lastEventType: 'SEARCH_EMPTY',
        transient: true,
      };

    case 'CANDIDATE_VIEW':
      return {
        expression: 'listening',
        animation: 'listening',
        expressionOverride: 'attentive-left',
        message: "Let's take a closer look.",
        subMessage: 'Reviewing candidate experience, evaluations, and notes.',
        lastEventType: 'CANDIDATE_VIEW',
        transient: false,
      };

    case 'CANDIDATE_ADD_START':
      return {
        expression: 'working',
        animation: 'listening',
        expressionOverride: 'attentive-left',
        message: "Let's add someone to your talent pool.",
        subMessage: 'Fill in candidate profile details, stage, and role.',
        lastEventType: 'CANDIDATE_ADD_START',
        transient: false,
      };

    case 'CANDIDATE_ADD_SUCCESS':
      return {
        expression: 'success',
        animation: 'excited',
        expressionOverride: 'joyful-wide',
        message: 'Nice! A new candidate is in the pipeline.',
        subMessage: (payload.data?.name as string) || 'Candidate record saved successfully.',
        lastEventType: 'CANDIDATE_ADD_SUCCESS',
        transient: true,
      };

    case 'CANDIDATE_ADD_FAIL':
      return {
        expression: 'error',
        animation: 'confused',
        expressionOverride: 'skeptical-right',
        message: 'A couple of details need your attention.',
        subMessage: (payload.data?.error as string) || 'Please check the required form fields.',
        lastEventType: 'CANDIDATE_ADD_FAIL',
        transient: true,
      };

    case 'CANDIDATE_UPDATE_SUCCESS':
      return {
        expression: 'happy',
        animation: 'happy',
        expressionOverride: 'joyful-down-right',
        message: 'Candidate details updated!',
        subMessage: (payload.data?.name as string) || 'Changes have been persisted.',
        lastEventType: 'CANDIDATE_UPDATE_SUCCESS',
        transient: true,
      };

    case 'CANDIDATE_DELETE_SUCCESS':
      return {
        expression: 'sad',
        animation: 'idle',
        expressionOverride: 'gentle-downward-gaze',
        message: 'Candidate removed.',
        subMessage: (payload.data?.name as string) || 'Application removed from talent pool.',
        lastEventType: 'CANDIDATE_DELETE_SUCCESS',
        transient: true,
      };

    case 'CANDIDATE_STAGE_CHANGE':
      return {
        expression: 'excited',
        animation: 'excited',
        expressionOverride: 'joyful-wide',
        message: 'Pipeline updated. Nice progress!',
        subMessage: (payload.data?.summary as string) || 'Candidate moved to next hiring stage.',
        lastEventType: 'CANDIDATE_STAGE_CHANGE',
        transient: true,
      };

    case 'THEME_CHANGE':
      return {
        expression: 'curious',
        animation: 'curious',
        expressionOverride: 'curious-left',
        message: 'A fresh look!',
        subMessage: `Switched to ${(payload.data?.theme as string) || 'new'} theme.`,
        lastEventType: 'THEME_CHANGE',
        transient: true,
      };

    case 'DATA_LOADING':
      return {
        expression: 'working',
        animation: 'working',
        expressionOverride: 'attentive-left',
        message: 'Syncing with the database...',
        subMessage: (payload.data?.message as string) || 'Loading candidates and recruitment metrics.',
        lastEventType: 'DATA_LOADING',
        transient: true,
      };

    case 'DATABASE_ERROR':
      return {
        expression: 'error',
        animation: 'confused',
        expressionOverride: 'skeptical-left',
        message: 'Database connection issue.',
        subMessage: (payload.data?.error as string) || 'Check your network or credentials.',
        lastEventType: 'DATABASE_ERROR',
        transient: true,
      };

    case 'IDLE_TIMEOUT':
    default:
      return {
        expression: currentRoute === 'candidates' ? 'listening' : 'neutral',
        animation: currentRoute === 'candidates' ? 'listening' : 'idle',
        expressionOverride: null,
        message: "I'm right here if you need assistance.",
        subMessage: 'Explore candidates or track pipeline progress.',
        lastEventType: 'IDLE_TIMEOUT',
        transient: false,
      };
  }
}
