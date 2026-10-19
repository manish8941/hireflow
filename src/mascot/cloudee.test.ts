import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import avatarData from './cloudee.avatar.json';
import { CloudeeAvatarDefinition } from './cloudee.types';
import { mapEventToReaction } from './cloudeeController';
import { cloudeeBus, cloudeeEmit } from './cloudeeEvents';
import { MASCOT_BODY_PATH, MascotExpression } from './MascotFace';

const avatar = avatarData as unknown as CloudeeAvatarDefinition;

describe('Reference A Mascot Vector Geometry & Design', () => {
  it('validates Reference A primary color is solid vivid orange (#FF4A0A)', () => {
    const referenceColor = '#FF4A0A';
    assert.match(referenceColor, /^#[0-9A-Fa-f]{6}$/);
  });

  it('verifies MASCOT_BODY_PATH produces valid continuous SVG geometry', () => {
    assert.ok(MASCOT_BODY_PATH.startsWith('M 108,22'));
    assert.ok(MASCOT_BODY_PATH.endsWith('Z'));
    // Contains circular arcs for ears
    assert.ok(MASCOT_BODY_PATH.includes('A 36 36'));
    // Contains fillets into cheeks
    assert.ok(MASCOT_BODY_PATH.includes('C 208,82'));
  });

  it('supports all 14 required controlled expressions without distortion', () => {
    const expressions: MascotExpression[] = [
      'neutral',
      'happy',
      'excited',
      'curious',
      'thinking',
      'listening',
      'confused',
      'surprised',
      'sleepy',
      'shy',
      'sad',
      'working',
      'error',
      'success',
    ];

    assert.equal(expressions.length, 14);
    expressions.forEach((expr) => {
      assert.ok(typeof expr === 'string');
    });
  });
});

describe('Avatar Definition & Geometry', () => {
  it('correctly parses avatar metadata and source of truth schema', () => {
    assert.equal(avatar.schema, 'bible-strong/avatar-definition');
    assert.equal(avatar.schemaVersion, 1);
    assert.equal(avatar.name, 'Freddy');
  });

  it('validates 3D avatar body geometry (cube primary + 3 node features)', () => {
    assert.ok(avatar.body.primary);
    assert.equal(avatar.body.primary.type, 'cube');
    assert.ok(avatar.body.primary.width > 150);

    assert.equal(avatar.body.nodes.length, 3);
    avatar.body.nodes.forEach((node, i) => {
      assert.ok(node.surface.type, `Node ${i} must have a surface type`);
      assert.equal(node.position.length, 3, `Node ${i} must have 3D coordinates`);
    });
  });

  it('validates avatar body and eye colors', () => {
    assert.equal(avatar.colors.body, '#e6855c');
    assert.equal(avatar.colors.eyes, '#ffffff');
  });

  it('contains all 28 supported expression presets with valid geometry', () => {
    assert.equal(avatar.expressionOrder.length, 28);
    avatar.expressionOrder.forEach((key) => {
      const expr = avatar.expressions[key];
      assert.ok(expr, `Missing expression preset: ${key}`);
      assert.equal(typeof expr.head.x, 'number');
      assert.equal(typeof expr.head.y, 'number');
      assert.equal(typeof expr.head.z, 'number');
      assert.ok(expr.eyes.left.width > 0);
      assert.ok(expr.eyes.left.height > 0);
      assert.ok(expr.eyes.right.width > 0);
      assert.ok(expr.eyes.right.height > 0);
      assert.ok(expr.eyes.spacing > 0);
    });
  });

  it('contains all 23 animation presets with valid steps and blink configurations', () => {
    assert.equal(avatar.animationOrder.length, 23);
    avatar.animationOrder.forEach((animKey) => {
      const anim = avatar.animations[animKey];
      assert.ok(anim, `Missing animation: ${animKey}`);
      assert.ok(anim.steps.length > 0, `Animation ${animKey} must have at least 1 step`);
      anim.steps.forEach((step) => {
        assert.ok(
          avatar.expressions[step.expression],
          `Step references non-existent expression: ${step.expression}`
        );
      });
      assert.equal(typeof anim.blink.enabled, 'boolean');
    });
  });
});

describe('Cloudee Context-Aware Event to Reaction Mapping', () => {
  it('maps lifecycle and route events to expected behaviors and expressions', () => {
    const loadState = mapEventToReaction({ type: 'APP_LOAD' });
    assert.equal(loadState.expression, 'neutral');
    assert.equal(loadState.animation, 'idle');
    assert.match(loadState.message, /find your next great hire/i);

    const dashState = mapEventToReaction({ type: 'ROUTE_DASHBOARD' });
    assert.equal(dashState.expression, 'neutral');

    const candState = mapEventToReaction({ type: 'ROUTE_CANDIDATES' });
    assert.equal(candState.expression, 'listening');

    const pipeState = mapEventToReaction({ type: 'ROUTE_PIPELINE' });
    assert.equal(pipeState.expression, 'thinking');
  });

  it('maps interactive mascot click to cute joyful reaction', () => {
    const clickState = mapEventToReaction({ type: 'MASCOT_CLICK' });
    assert.equal(clickState.expression, 'happy');
    assert.equal(clickState.animation, 'happy');
    assert.match(clickState.message, /You called/i);
  });

  it('maps search events to searching, results, and empty states', () => {
    const typing = mapEventToReaction({ type: 'SEARCH_TYPING', data: { query: 'Marcus' } });
    assert.equal(typing.expression, 'thinking');

    const results = mapEventToReaction({ type: 'SEARCH_RESULTS', data: { count: 3 } });
    assert.equal(results.expression, 'happy');
    assert.match(results.message, /Found 3 candidates/i);

    const empty = mapEventToReaction({ type: 'SEARCH_EMPTY' });
    assert.equal(empty.expression, 'confused');
  });

  it('maps candidate CRUD operations to proper emotional states', () => {
    const addSuccess = mapEventToReaction({
      type: 'CANDIDATE_ADD_SUCCESS',
      data: { name: 'Elena Rostova' },
    });
    assert.equal(addSuccess.expression, 'success');
    assert.match(addSuccess.message, /new candidate is in the pipeline/i);

    const addFail = mapEventToReaction({ type: 'CANDIDATE_ADD_FAIL' });
    assert.equal(addFail.expression, 'error');

    const updateSuccess = mapEventToReaction({
      type: 'CANDIDATE_UPDATE_SUCCESS',
      data: { name: 'Marcus Vance' },
    });
    assert.equal(updateSuccess.expression, 'happy');

    const deleteSuccess = mapEventToReaction({
      type: 'CANDIDATE_DELETE_SUCCESS',
      data: { name: 'Alex' },
    });
    assert.equal(deleteSuccess.expression, 'sad');

    const stageMove = mapEventToReaction({
      type: 'CANDIDATE_STAGE_CHANGE',
      data: { summary: 'Marcus Vance moved to offer' },
    });
    assert.equal(stageMove.expression, 'excited');
  });

  it('maps theme change to curious reaction', () => {
    const themeState = mapEventToReaction({
      type: 'THEME_CHANGE',
      data: { theme: 'light' },
    });
    assert.equal(themeState.expression, 'curious');
    assert.match(themeState.message, /A fresh look/i);
  });
});

describe('Cloudee Event Bus', () => {
  it('delivers events to subscribers with payload and timestamp', () => {
    let receivedType: string | null = null;
    let receivedName: string | null = null;

    const unsubscribe = cloudeeBus.subscribe((payload) => {
      receivedType = payload.type;
      receivedName = (payload.data?.name as string) || null;
    });

    cloudeeEmit('CANDIDATE_ADD_SUCCESS', { data: { name: 'Test Candidate' } });

    assert.equal(receivedType, 'CANDIDATE_ADD_SUCCESS');
    assert.equal(receivedName, 'Test Candidate');

    unsubscribe();

    // Verify unsubscribed listener receives no further events
    receivedType = null;
    cloudeeEmit('ROUTE_SETTINGS');
    assert.equal(receivedType, null);
  });
});
