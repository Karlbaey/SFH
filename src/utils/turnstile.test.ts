/// <reference types="node" />

import assert from 'node:assert/strict';
import test from 'node:test';
import * as turnstile from './turnstile';

test('createTurnstileCommentPayload only includes a token when enabled and present', () => {
  assert.deepEqual(turnstile.createTurnstileCommentPayload(false, 'token-1'), {});
  assert.deepEqual(turnstile.createTurnstileCommentPayload(true, ''), {});
  assert.deepEqual(turnstile.createTurnstileCommentPayload(true, 'token-1'), {
    turnstile: 'token-1',
  });
});

test('resolveTurnstileSubmit defers the first enabled submit until verification exists', () => {
  const { resolveTurnstileSubmit } = turnstile as {
    resolveTurnstileSubmit?: (enabled: boolean, token: string) => {
      shouldSubmit: boolean;
      shouldShowTurnstile: boolean;
      shouldPendSubmit: boolean;
    };
  };

  assert.equal(typeof resolveTurnstileSubmit, 'function');
  assert.deepEqual(resolveTurnstileSubmit?.(true, ''), {
    shouldSubmit: false,
    shouldShowTurnstile: true,
    shouldPendSubmit: true,
  });
  assert.deepEqual(resolveTurnstileSubmit?.(false, ''), {
    shouldSubmit: true,
    shouldShowTurnstile: false,
    shouldPendSubmit: false,
  });
  assert.deepEqual(resolveTurnstileSubmit?.(true, 'token-1'), {
    shouldSubmit: true,
    shouldShowTurnstile: true,
    shouldPendSubmit: false,
  });
});
