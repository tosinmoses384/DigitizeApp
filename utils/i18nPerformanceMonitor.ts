interface I18nMetrics {
  loadTime: number;
  switchTime: number;
  cacheHitCount: number;
  cacheMissCount: number;
}

export class I18nPerformanceMonitor {
  private static metrics: I18nMetrics = {
    loadTime: 0,
    switchTime: 0,
    cacheHitCount: 0,
    cacheMissCount: 0,
  };

  static startLoadTimer(): () => void {
    const start = performance.now();
    
    return () => {
      const end = performance.now();
      this.metrics.loadTime = end - start;
      
      if (__DEV__) {
        console.log(`⏱️  Translation load time: ${this.metrics.loadTime.toFixed(2)}ms`);
      }
    };
  }

  static startSwitchTimer(): () => void {
    const start = performance.now();
    
    return () => {
      const end = performance.now();
      this.metrics.switchTime = end - start;
      
      if (__DEV__) {
        console.log(`⏱️  Language switch time: ${this.metrics.switchTime.toFixed(2)}ms`);
      }
    };
  }

  static recordCacheHit(): void {
    this.metrics.cacheHitCount++;
  }

  static recordCacheMiss(): void {
    this.metrics.cacheMissCount++;
  }

  static getCacheHitRate(): number {
    const total = this.metrics.cacheHitCount + this.metrics.cacheMissCount;
    if (total === 0) {
      return 0;
    }
    return (this.metrics.cacheHitCount / total) * 100;
  }

  static getMetrics(): Readonly<I18nMetrics> {
    return { ...this.metrics };
  }

  static logReport(): void {
    if (!__DEV__) {
      return;
    }

    console.log('\n📊 i18n Performance Report:');
    console.log(`   Load Time: ${this.metrics.loadTime.toFixed(2)}ms`);
    console.log(`   Switch Time: ${this.metrics.switchTime.toFixed(2)}ms`);
    console.log(`   Cache Hit Rate: ${this.getCacheHitRate().toFixed(2)}%`);
    console.log(`   Cache Hits: ${this.metrics.cacheHitCount}`);
    console.log(`   Cache Misses: ${this.metrics.cacheMissCount}`);
  }

  static reset(): void {
    this.metrics = {
      loadTime: 0,
      switchTime: 0,
      cacheHitCount: 0,
      cacheMissCount: 0,
    };
  }
}

export default I18nPerformanceMonitor;

