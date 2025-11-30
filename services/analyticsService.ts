import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules } from 'react-native';

type AnalyticsEventProperties = Record<string, unknown>;

interface AnalyticsProvider {
  init: (apiKey: string) => void;
  identifyUser: (userId: string | null) => Promise<void>;
  setTrackingEnabled: (enabled: boolean) => Promise<void>;
  trackEvent: (name: string, props?: AnalyticsEventProperties) => void;
}

interface VexoModule {
  vexo: (apiKey: string) => void;
  identifyDevice: (userId: string | null) => Promise<void>;
  enableTracking: () => Promise<void>;
  disableTracking: () => Promise<void>;
  customEvent: (name: string, props: Record<string, unknown>) => void;
}

let isInitialized = false;
let isInitializing = false;
let initializationComplete = false;
let eventQueue: { name: string; props?: AnalyticsEventProperties }[] = [];
let sensitiveModeCounter = 0;
let globalEventContext: AnalyticsEventProperties = {};
let samplingRules: Record<string, number> = {};
let vexoModule: VexoModule | null = null;
let lastRequestedIdentity: string | null = null;

function isExpoGo(): boolean {
  return Constants.appOwnership === 'expo';
}

function canUseVexo(): boolean {
  return !isExpoGo();
}

function hasNativeModule(): boolean {
  return NativeModules.RNVexo !== undefined;
}

function getVexoModule(): VexoModule | null {
  if (vexoModule) {
    return vexoModule;
  }

  if (!canUseVexo()) {
    return null;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    vexoModule = require('vexo-analytics');
    return vexoModule;
  } catch (error) {
    if (__DEV__) {
      console.error('Vexo Analytics: Failed to load package', error);
    }
    return null;
  }
}

const noopProvider: AnalyticsProvider = {
  init: () => {},
  identifyUser: async () => {},
  setTrackingEnabled: async () => {},
  trackEvent: () => {},
};

const IDENTITY_KEY = 'analytics:identity';

async function loadPersistedIdentity(): Promise<void> {
  try {
    const stored = await AsyncStorage.getItem(IDENTITY_KEY);
    const normalized = stored ? String(stored).toLowerCase().trim() : null;
    lastRequestedIdentity = normalized && normalized.length > 0 ? normalized : null;
  } catch {}
  try {
    if (isInitialized && initializationComplete) {
      const module = getVexoModule();
      if (module) {
        await module.identifyDevice(lastRequestedIdentity ?? null);
      }
    }
  } catch {}
}

const vexoProvider: AnalyticsProvider = {
  init: (apiKey: string) => {
    // Load any previously persisted identity as early as possible
    void loadPersistedIdentity();
    if (isInitialized && initializationComplete) {
      return;
    }
    
    if (isInitialized && isInitializing) {
      return;
    }
    
    if (isInitialized) {
      initializationComplete = false;
      isInitializing = false;
      eventQueue = [];
    }
    
    if (!apiKey) {
      return;
    }
    
    if (!canUseVexo()) {
      return;
    }
    
    const module = getVexoModule();
    if (!module) {
      return;
    }
    
    try {
      if (typeof module.vexo !== 'function') {
        return;
      }
      
      module.vexo(apiKey);
      isInitialized = true;
      isInitializing = true;
      
      setTimeout(() => {
        initializationComplete = true;
        isInitializing = false;
        
        const queue = [...eventQueue];
        eventQueue = [];
        
        queue.forEach(({ name, props }) => {
          try {
            module.customEvent(name, props ?? {});
          } catch (error) {
            if (__DEV__) {
              console.error('Vexo Analytics: Failed to process queued event', error);
            }
          }
        });

        try {
          const id = lastRequestedIdentity ?? null;
          void module.identifyDevice(id);
        } catch {}
      }, 2000);
    } catch (error) {
      if (__DEV__) {
        console.error('Vexo Analytics: Initialization failed', error);
      }
    }
  },
  
  identifyUser: async (userId: string | null) => {
    if (!canUseVexo()) {
      return;
    }
    
    const module = getVexoModule();
    if (!module) {
      return;
    }
    
    try {
      const normalized = userId === null ? null : String(userId).toLowerCase().trim();
      lastRequestedIdentity = normalized;
      try {
        if (normalized && normalized.length > 0) {
          await AsyncStorage.setItem(IDENTITY_KEY, normalized);
        } else {
          await AsyncStorage.removeItem(IDENTITY_KEY);
        }
      } catch {}

      if (!isInitialized || isInitializing || !initializationComplete) {
        return;
      }

      await module.identifyDevice(normalized);
    } catch (error) {
      if (__DEV__) {
        console.error('Vexo Analytics: identifyUser failed', error);
      }
    }
  },
  
  setTrackingEnabled: async (enabled: boolean) => {
    if (!canUseVexo()) {
      return;
    }
    
    const module = getVexoModule();
    if (!module) {
      return;
    }
    
    try {
      if (enabled) {
        await module.enableTracking();
        if (isInitialized && initializationComplete) {
          const id = lastRequestedIdentity ?? null;
          await module.identifyDevice(id);
        }
      } else {
        await module.disableTracking();
      }
    } catch (error) {
      if (__DEV__) {
        console.error('Vexo Analytics: setTrackingEnabled failed', error);
      }
    }
  },
  
  trackEvent: (name: string, props?: AnalyticsEventProperties) => {
    if (!canUseVexo()) {
      return;
    }
    
    if (!isInitialized) {
      return;
    }
    
    const module = getVexoModule();
    if (!module) {
      return;
    }
    
    if (!initializationComplete || isInitializing) {
      eventQueue.push({ name, props });
      return;
    }
    
    try {
      if (typeof module.customEvent !== 'function') {
        return;
      }
      
      module.customEvent(name, props ?? {});
    } catch (error) {
      if (__DEV__) {
        console.error('Vexo Analytics: trackEvent failed', error);
      }
    }
  },
};

function resolveProvider(): AnalyticsProvider {
  const rawProviderName = process.env.EXPO_PUBLIC_ANALYTICS_PROVIDER || 'vexo';
  const providerName = rawProviderName.toLowerCase();
  
  if (providerName === 'none' || providerName === 'noop' || providerName === 'off') {
    return noopProvider;
  }
  if (!canUseVexo()) {
    return noopProvider;
  }
  
  return vexoProvider;
}

const provider = resolveProvider();

export function initAnalytics(apiKey: string): void {
  provider.init(apiKey);
}

export async function identifyUser(userId: string | null): Promise<void> {
  await provider.identifyUser(userId);
}

export async function setTrackingEnabled(enabled: boolean): Promise<void> {
  await provider.setTrackingEnabled(enabled);
}

export function trackEvent(name: string, props?: AnalyticsEventProperties): void {
  if (__DEV__) {
    console.log('📊 Event:', name, props);
  }
  
  if (sensitiveModeCounter > 0) {
    return;
  }
  const rate = samplingRules[name] ?? 1;
  if (rate < 1) {
    const rnd = Math.random();
    if (rnd > rate) {
      return;
    }
  }
  
  const mergedProps = { ...(globalEventContext || {}), ...(props || {}) };
  provider.trackEvent(name, mergedProps);
}

export type { AnalyticsEventProperties };

const CONSENT_KEY = 'analytics:consent';
const VERSION_SEEN_KEY = 'analytics:lastVersionSeen';

export async function getUserConsent(): Promise<boolean> {
  try {
    const stored = await AsyncStorage.getItem(CONSENT_KEY);
    if (stored === null) {
      return true;
    }
    return stored === 'true';
  } catch {
    return true;
  }
}

export async function setUserConsent(enabled: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(CONSENT_KEY, String(enabled));
  } catch {}
  
  if (!isInitialized) {
    const apiKey = getVexoApiKey();
    if (apiKey) {
      initAnalytics(apiKey);
    }
  }
}

export function setGlobalEventContext(context: AnalyticsEventProperties): void {
  globalEventContext = context;
}

export function setEventSamplingRules(rules: Record<string, number>): void {
  samplingRules = { ...rules };
}

export function enterSensitiveMode(): void {
  sensitiveModeCounter = Math.max(0, sensitiveModeCounter) + 1;
}

export function exitSensitiveMode(): void {
  sensitiveModeCounter = Math.max(0, sensitiveModeCounter - 1);
}

export async function maybeEmitFirstOpenOnVersion(): Promise<void> {
  try {
    const version = (Constants.expoConfig as any)?.version || (Constants.manifest2 as any)?.extra?.expoClient?.version || '';
    if (!version) {
      return;
    }
    const last = await AsyncStorage.getItem(VERSION_SEEN_KEY);
    if (last !== version) {
      await AsyncStorage.setItem(VERSION_SEEN_KEY, version);
      trackEvent('first-open-on-version', { version });
    }
  } catch {}
}

export interface AnalyticsStatus {
  isAvailable: boolean;
  isInitialized: boolean;
  hasNativeModule: boolean;
  provider: string;
  environment: string;
  apiKeyConfigured: boolean;
}

function getVexoApiKey(): string {
  return (
    (Constants.expoConfig?.extra as any)?.vexoApiKey ||
    process.env.EXPO_VEXO_API_KEY ||
    process.env.EXPO_PUBLIC_VEXO_API_KEY ||
    ''
  );
}

export async function getAnalyticsStatus(): Promise<AnalyticsStatus> {
  const apiKey = getVexoApiKey();
  const providerName = (process.env.EXPO_PUBLIC_ANALYTICS_PROVIDER || 'vexo').toLowerCase();
  const nativeAvailable = hasNativeModule();
  const available = canUseVexo() && providerName !== 'none' && providerName !== 'noop' && providerName !== 'off';
  
  return {
    isAvailable: available,
    isInitialized,
    hasNativeModule: nativeAvailable,
    provider: providerName,
    environment: isExpoGo() ? 'expo-go' : 'dev-build',
    apiKeyConfigured: apiKey.length > 0,
  };
}

export function trackEventWithDebug(name: string, props?: AnalyticsEventProperties): void {
  if (__DEV__) {
    const status = {
      name,
      props,
      sensitiveMode: sensitiveModeCounter > 0,
      isInitialized,
    };
    console.log('📊 Analytics Event:', JSON.stringify(status, null, 2));
  }
  trackEvent(name, props);
}
// Auto-initialize at module load to ensure Vexo hooks navigation early
try {
  const autoKey = (
    (Constants.expoConfig?.extra as any)?.vexoApiKey ||
    process.env.EXPO_VEXO_API_KEY ||
    process.env.EXPO_PUBLIC_VEXO_API_KEY ||
    ''
  );
  if (autoKey) {
    provider.init(autoKey);
  }
} catch {}