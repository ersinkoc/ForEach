const { forEach, forEachLazy, forEachParallel } = require('../dist/index.js');
const { performance } = require('perf_hooks');

// Benchmark configuration
const ITERATIONS = 10;
const DATA_SIZES = {
  small: 1000,
  medium: 10000,
  large: 100000
};

// Generate test data
function generateTestData(size) {
  return Array.from({ length: size }, (_, i) => ({
    id: i,
    value: Math.random() * 100,
    category: ['A', 'B', 'C', 'D'][i % 4]
  }));
}

// Benchmark function
function benchmark(name, fn, iterations = ITERATIONS) {
  const times = [];
  
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    fn();
    const end = performance.now();
    times.push(end - start);
  }
  
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const min = Math.min(...times);
  const max = Math.max(...times);
  
  console.log(`${name}:`);
  console.log(`  Average: ${avg.toFixed(2)}ms`);
  console.log(`  Min: ${min.toFixed(2)}ms`);
  console.log(`  Max: ${max.toFixed(2)}ms`);
  console.log('');
  
  return { avg, min, max };
}

// Native implementations for comparison
function nativeForEach(data, callback) {
  data.forEach(callback);
}

function nativeFilter(data, predicate) {
  return data.filter(predicate);
}

function nativeMap(data, transform) {
  return data.map(transform);
}

function nativeChain(data) {
  return data
    .filter(item => item.value > 50)
    .map(item => item.value * 2)
    .slice(0, 100);
}

// Custom implementations
function customForEach(data, callback) {
  forEach(data, callback);
}

function customLazyChain(data) {
  return forEachLazy(data)
    .filter(item => item.value > 50)
    .map(item => item.value * 2)
    .take(100)
    .toArray();
}

async function customParallel(data, callback) {
  await forEachParallel(data, callback, { concurrency: 10 });
}

// Run benchmarks
async function runBenchmarks() {
  console.log('🚀 @oxog/foreach Performance Benchmarks\n');
  console.log('=' .repeat(50));
  
  for (const [sizeName, size] of Object.entries(DATA_SIZES)) {
    console.log(`\n📊 Testing with ${sizeName} dataset (${size.toLocaleString()} items)\n`);
    
    const data = generateTestData(size);
    let processedCount = 0;
    const simpleCallback = () => { processedCount++; };
    
    // Simple iteration benchmarks
    console.log('🔄 Simple Iteration:');
    
    processedCount = 0;
    benchmark('Native forEach', () => {
      nativeForEach(data, simpleCallback);
    });
    
    processedCount = 0;
    benchmark('@oxog/foreach', () => {
      customForEach(data, simpleCallback);
    });
    
    // Filtering benchmarks
    console.log('🔍 Filtering (value > 50):');
    
    benchmark('Native filter', () => {
      nativeFilter(data, item => item.value > 50);
    });
    
    benchmark('@oxog/foreach lazy', () => {
      forEachLazy(data)
        .filter(item => item.value > 50)
        .toArray();
    });
    
    // Complex chain benchmarks
    console.log('⛓️  Complex Chain (filter + map + take):');
    
    benchmark('Native chain', () => {
      nativeChain(data);
    });
    
    benchmark('@oxog/foreach lazy chain', () => {
      customLazyChain(data);
    });
    
    // Async benchmarks (smaller dataset for async)
    if (size <= 10000) {
      console.log('⚡ Async Processing:');
      
      const asyncCallback = async (item) => {
        await new Promise(resolve => setTimeout(resolve, 0.01));
      };
      
      await benchmark('Sequential async', async () => {
        for (const item of data.slice(0, 100)) {
          await asyncCallback(item);
        }
      }, 3);
      
      await benchmark('@oxog/foreach parallel', async () => {
        await customParallel(data.slice(0, 100), asyncCallback);
      }, 3);
    }
    
    console.log('-'.repeat(50));
  }
  
  // Memory usage test
  console.log('\n🧠 Memory Usage Test:\n');
  
  const hugeData = generateTestData(1000000);
  
  console.log('Processing 1M items...');
  
  const memBefore = process.memoryUsage();
  
  // Traditional approach
  console.time('Traditional (loads all in memory)');
  const traditional = hugeData
    .filter(item => item.value > 90)
    .map(item => item.value * 2)
    .slice(0, 10);
  console.timeEnd('Traditional (loads all in memory)');
  
  const memAfterTraditional = process.memoryUsage();
  
  // Lazy approach
  console.time('Lazy (constant memory)');
  const lazy = forEachLazy(hugeData)
    .filter(item => item.value > 90)
    .map(item => item.value * 2)
    .take(10)
    .toArray();
  console.timeEnd('Lazy (constant memory)');
  
  const memAfterLazy = process.memoryUsage();
  
  console.log('\nMemory Usage:');
  console.log(`Traditional: ${((memAfterTraditional.heapUsed - memBefore.heapUsed) / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Lazy: ${((memAfterLazy.heapUsed - memAfterTraditional.heapUsed) / 1024 / 1024).toFixed(2)} MB`);
  
  console.log('\nResults are identical:', JSON.stringify(traditional) === JSON.stringify(lazy));
  
  console.log('\n✅ Benchmarks completed!');
}

// Error handling benchmark
function errorHandlingBenchmark() {
  console.log('\n⚠️  Error Handling Performance:\n');
  
  const data = generateTestData(10000);
  const errorCallback = (item) => {
    if (item.id % 1000 === 0) {
      throw new Error('Test error');
    }
  };
  
  benchmark('With error handling', () => {
    try {
      forEach(data, errorCallback, { breakOnError: false });
    } catch (e) {
      // Ignore errors
    }
  });
  
  benchmark('Without errors', () => {
    forEach(data, () => {});
  });
}

// Run all benchmarks
if (require.main === module) {
  runBenchmarks()
    .then(() => errorHandlingBenchmark())
    .catch(console.error);
}

module.exports = {
  benchmark,
  generateTestData,
  runBenchmarks
};