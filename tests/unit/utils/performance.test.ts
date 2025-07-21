import {
  PerformanceTracker,
  measurePerformance,
  measureAsyncPerformance,
  throttle,
  debounce,
} from '../../../src/utils/performance';

describe('Performance Utilities', () => {
  describe('PerformanceTracker', () => {
    let tracker: PerformanceTracker;

    beforeEach(() => {
      tracker = new PerformanceTracker();
    });

    it('should track performance metrics', () => {
      tracker.start();
      tracker.incrementItems(5);
      tracker.stop();

      const metrics = tracker.getMetrics();
      expect(metrics.itemsProcessed).toBe(5);
      expect(metrics.totalTime).toBeGreaterThanOrEqual(0);
      expect(metrics.averageTimePerItem).toBeGreaterThanOrEqual(0);
      expect(metrics.throughput).toBeGreaterThanOrEqual(0);
    });

    it('should handle multiple increments', () => {
      tracker.start();
      tracker.incrementItems(3);
      tracker.incrementItems(2);
      tracker.incrementItems();
      tracker.stop();

      const metrics = tracker.getMetrics();
      expect(metrics.itemsProcessed).toBe(6);
    });

    it('should calculate metrics while running', () => {
      tracker.start();
      tracker.incrementItems(10);

      const metrics = tracker.getMetrics();
      expect(metrics.itemsProcessed).toBe(10);
      expect(metrics.totalTime).toBeGreaterThanOrEqual(0);
    });

    it('should handle zero items', () => {
      tracker.start();
      tracker.stop();

      const metrics = tracker.getMetrics();
      expect(metrics.itemsProcessed).toBe(0);
      expect(metrics.averageTimePerItem).toBe(0);
    });

    it('should reset correctly', () => {
      tracker.start();
      tracker.incrementItems(5);
      tracker.stop();
      tracker.reset();

      const metrics = tracker.getMetrics();
      expect(metrics.itemsProcessed).toBe(0);
      expect(metrics.totalTime).toBe(0);
      expect(metrics.averageTimePerItem).toBe(0);
      expect(metrics.throughput).toBe(0);
    });
  });

  describe('measurePerformance', () => {
    it('should measure synchronous function performance', () => {
      const fn = () => {
        let sum = 0;
        for (let i = 0; i < 1000; i++) {
          sum += i;
        }
        return sum;
      };

      const { result, duration } = measurePerformance(fn);
      expect(result).toBe(499500);
      expect(duration).toBeGreaterThanOrEqual(0);
    });

    it('should log performance with label', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      measurePerformance(() => 42, 'Test Operation');
      
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[Performance] Test Operation:'));
      consoleSpy.mockRestore();
    });
  });

  describe('measureAsyncPerformance', () => {
    it('should measure async function performance', async () => {
      const fn = async () => {
        return 'result';
      };

      const { result, duration } = await measureAsyncPerformance(fn);
      expect(result).toBe('result');
      expect(duration).toBeGreaterThanOrEqual(0);
    });

    it('should log async performance with label', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await measureAsyncPerformance(async () => 42, 'Async Operation');
      
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[Performance] Async Operation:'));
      consoleSpy.mockRestore();
    });
  });

  describe('throttle', () => {
    jest.useFakeTimers();

    it('should throttle function calls', () => {
      const fn = jest.fn();
      const throttled = throttle(fn, 100);

      throttled('first');
      throttled('second');
      throttled('third');

      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith('first');

      jest.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(2);
      expect(fn).toHaveBeenLastCalledWith('third');
    });

    it('should handle rapid calls', () => {
      const fn = jest.fn();
      const throttled = throttle(fn, 50);

      for (let i = 0; i < 10; i++) {
        throttled(i);
      }

      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith(0);

      jest.advanceTimersByTime(50);
      expect(fn).toHaveBeenCalledTimes(2);
      expect(fn).toHaveBeenLastCalledWith(9);
    });

    it('should respect time intervals', () => {
      const fn = jest.fn();
      const throttled = throttle(fn, 100);

      throttled(1);
      jest.advanceTimersByTime(150);
      throttled(2);

      expect(fn).toHaveBeenCalledTimes(2);
      expect(fn).toHaveBeenNthCalledWith(1, 1);
      expect(fn).toHaveBeenNthCalledWith(2, 2);
    });
  });

  describe('debounce', () => {
    jest.useFakeTimers();

    it('should debounce function calls', () => {
      const fn = jest.fn();
      const debounced = debounce(fn, 100);

      debounced('first');
      debounced('second');
      debounced('third');

      expect(fn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith('third');
    });

    it('should reset timer on each call', () => {
      const fn = jest.fn();
      const debounced = debounce(fn, 100);

      debounced(1);
      jest.advanceTimersByTime(50);
      debounced(2);
      jest.advanceTimersByTime(50);
      debounced(3);

      expect(fn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith(3);
    });

    it('should handle multiple independent calls', () => {
      const fn = jest.fn();
      const debounced = debounce(fn, 50);

      debounced(1);
      jest.advanceTimersByTime(60);
      
      expect(fn).toHaveBeenCalledWith(1);
      
      debounced(2);
      jest.advanceTimersByTime(60);
      
      expect(fn).toHaveBeenCalledWith(2);
      expect(fn).toHaveBeenCalledTimes(2);
    });
  });
});