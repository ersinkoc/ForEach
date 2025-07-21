const { forEachChunked, forEachChunkedAsync } = require('@oxog/foreach');

// Simulate a large dataset
const largeDataset = Array.from({ length: 100000 }, (_, i) => ({
  id: i,
  value: Math.random() * 1000,
  category: ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)]
}));

// Synchronous chunked processing
console.log('=== Synchronous Chunked Processing ===');
const results = {
  A: 0,
  B: 0,
  C: 0,
  D: 0
};

let processedCount = 0;
const startTime = Date.now();

forEachChunked(largeDataset, (item) => {
  // Simulate some processing
  results[item.category] += item.value;
  processedCount++;
}, {
  chunkSize: 5000,
  onChunkComplete: (chunkIndex, count) => {
    const progress = ((chunkIndex + 1) * 5000 / largeDataset.length * 100).toFixed(1);
    console.log(`Chunk ${chunkIndex + 1} completed: ${count} items processed (${progress}%)`);
  }
});

console.log(`\nProcessing completed in ${Date.now() - startTime}ms`);
console.log('Results:', results);
console.log(`Total items processed: ${processedCount}`);

// Asynchronous chunked processing with delays
async function processWithBackpressure() {
  console.log('\n=== Async Chunked Processing with Backpressure ===');
  
  const batchResults = [];
  let totalProcessed = 0;
  const asyncStartTime = Date.now();

  await forEachChunkedAsync(largeDataset.slice(0, 10000), async (item) => {
    // Simulate async operation (e.g., database write)
    await new Promise(resolve => setTimeout(resolve, 0.1));
    batchResults.push(item.id);
    totalProcessed++;
  }, {
    chunkSize: 1000,
    concurrency: 10, // Process 10 items concurrently within each chunk
    delayBetweenChunks: 100, // 100ms delay between chunks
    onChunkComplete: (chunkIndex, count) => {
      console.log(`Async chunk ${chunkIndex + 1} completed: ${count} items`);
    }
  });

  console.log(`\nAsync processing completed in ${Date.now() - asyncStartTime}ms`);
  console.log(`Total async items processed: ${totalProcessed}`);
}

// Memory-efficient processing example
console.log('\n=== Memory-Efficient Processing ===');

function* generateLargeDataset() {
  for (let i = 0; i < 1000000; i++) {
    yield {
      id: i,
      data: `Item ${i}`,
      timestamp: Date.now()
    };
  }
}

// Convert generator to array in chunks to avoid memory issues
const generator = generateLargeDataset();
const chunk = [];
let chunkCount = 0;

// Process generator output in chunks
const processChunk = (items) => {
  let sum = 0;
  forEachChunked(items, (item) => {
    sum += item.id;
  }, {
    chunkSize: 1000,
    onChunkComplete: () => {
      chunkCount++;
    }
  });
  return sum;
};

// Read from generator in batches
let totalSum = 0;
for (let i = 0; i < 10; i++) { // Process first 10 chunks only
  chunk.length = 0;
  for (let j = 0; j < 10000; j++) {
    const { value, done } = generator.next();
    if (done) break;
    chunk.push(value);
  }
  if (chunk.length === 0) break;
  
  totalSum += processChunk(chunk);
  console.log(`Processed batch ${i + 1}: ${chunk.length} items`);
}

console.log(`\nTotal chunks processed: ${chunkCount}`);
console.log(`Sum of IDs: ${totalSum}`);

// Run async example
processWithBackpressure().catch(console.error);