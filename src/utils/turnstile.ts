const TURNSTILE_SCRIPT = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

export interface TurnstileLike {
  render: (container: HTMLElement, options: Record<string, unknown>) => string;
  reset: (widgetId: string) => void;
}

interface TurnstileWindow extends Window {
  turnstile?: TurnstileLike;
}

let turnstileScriptPromise: Promise<TurnstileLike> | undefined;

export function isTurnstileEnabled(turnstileKey: string): boolean {
  return turnstileKey.trim().length > 0;
}

export function createTurnstileCommentPayload(
  enabled: boolean,
  token: string,
): { turnstile?: string } {
  if (!enabled || !token) return {};

  return { turnstile: token };
}

export function resolveTurnstileSubmit(
  enabled: boolean,
  token: string,
): {
  shouldSubmit: boolean;
  shouldShowTurnstile: boolean;
  shouldPendSubmit: boolean;
} {
  if (!enabled) {
    return {
      shouldSubmit: true,
      shouldShowTurnstile: false,
      shouldPendSubmit: false,
    };
  }

  if (token) {
    return {
      shouldSubmit: true,
      shouldShowTurnstile: true,
      shouldPendSubmit: false,
    };
  }

  return {
    shouldSubmit: false,
    shouldShowTurnstile: true,
    shouldPendSubmit: true,
  };
}

export function ensureTurnstileScript(
  win: Window & typeof globalThis,
  doc: Document,
): Promise<TurnstileLike> {
  const turnstileWindow = win as TurnstileWindow;

  if (turnstileWindow.turnstile) {
    return Promise.resolve(turnstileWindow.turnstile);
  }

  if (turnstileScriptPromise) return turnstileScriptPromise;

  turnstileScriptPromise = new Promise((resolve, reject) => {
    const existing = doc.querySelector<HTMLScriptElement>(`script[src="${TURNSTILE_SCRIPT}"]`);
    const script = existing ?? doc.createElement('script');

    const onLoad = () => {
      if (turnstileWindow.turnstile) {
        resolve(turnstileWindow.turnstile);
        return;
      }

      turnstileScriptPromise = undefined;
      reject(new Error('Failed to load Turnstile.'));
    };

    const onError = () => {
      turnstileScriptPromise = undefined;
      reject(new Error('Failed to load Turnstile.'));
    };

    script.addEventListener('load', onLoad, { once: true });
    script.addEventListener('error', onError, { once: true });

    if (!existing) {
      script.src = TURNSTILE_SCRIPT;
      script.async = true;
      doc.head.appendChild(script);
    }
  });

  return turnstileScriptPromise;
}

export function resetTurnstileWidget(
  turnstile: Pick<TurnstileLike, 'reset'> | undefined,
  widgetId: string | undefined,
): void {
  if (!turnstile || !widgetId) return;

  turnstile.reset(widgetId);
}
