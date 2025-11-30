import * as Crypto from 'expo-crypto';
import { trackEvent } from '@services/analyticsService';

function sanitizeMessage(message: unknown): string {
  if (!message) {
    return '';
  }
  const text = String(message);
  if (text.length > 500) {
    return text.slice(0, 500);
  }
  return text;
}

async function getStackHash(stack?: string): Promise<string> {
  try {
    const val = stack || '';
    return await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, val);
  } catch {
    return '';
  }
}

export function setupGlobalErrorHandlers(): void {
  try {
    const anyGlobal: any = globalThis as any;
    if (anyGlobal.ErrorUtils && typeof anyGlobal.ErrorUtils.setGlobalHandler === 'function') {
      const originalHandler = anyGlobal.ErrorUtils.getGlobalHandler?.();
      anyGlobal.ErrorUtils.setGlobalHandler(async (error: Error, isFatal?: boolean) => {
        const payload = {
          message: sanitizeMessage(error?.message),
          isFatal: Boolean(isFatal),
          stackHash: await getStackHash(error?.stack),
        };
        trackEvent('js-exception', payload);
        if (typeof originalHandler === 'function') {
          try { originalHandler(error, isFatal); } catch {}
        }
      });
    }
  } catch {}

  try {
    const anyGlobal: any = globalThis as any;
    if (typeof anyGlobal.addEventListener === 'function') {
      anyGlobal.addEventListener('unhandledrejection', async (event: any) => {
        const reason = event?.reason;
        const message = typeof reason === 'object' && reason?.message ? reason.message : String(reason);
        const stack = typeof reason === 'object' && reason?.stack ? reason.stack : undefined;
        trackEvent('js-exception', {
          message: sanitizeMessage(message),
          isUnhandledRejection: true,
          stackHash: await getStackHash(stack),
        });
      });
    }
  } catch {}
}


