export class I18nDevTools {
  private static missingKeys = new Set<string>();
  private static isDevelopment = __DEV__;

  static logMissingKey(key: string): void {
    if (!this.isDevelopment) {
      return;
    }

    if (!this.missingKeys.has(key)) {
      this.missingKeys.add(key);
      console.warn(`🔴 Missing translation: "${key}"`);
    }
  }

  static getMissingSummary(): string[] {
    return Array.from(this.missingKeys);
  }

  static clearMissingKeys(): void {
    this.missingKeys.clear();
  }

  static exportMissingKeys(): void {
    if (!this.isDevelopment) {
      return;
    }

    const keys = this.getMissingSummary();
    if (keys.length === 0) {
      console.log('✅ No missing translation keys!');
      return;
    }

    console.log('\n📋 Missing Translation Keys:');
    console.log(JSON.stringify(keys, null, 2));
    console.log(`\nTotal missing: ${keys.length}`);
  }
}

export default I18nDevTools;

