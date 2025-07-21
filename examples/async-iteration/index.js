const { forEachAsync, forEachParallel } = require('@oxog/foreach');

// Simulate async operations
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchUserData(userId) {
  await delay(100 + Math.random() * 100);
  return {
    id: userId,
    name: `User ${userId}`,
    score: Math.floor(Math.random() * 100)
  };
}

async function main() {
  // Sequential async processing
  console.log('=== Sequential Async Processing ===');
  const userIds = [1, 2, 3, 4, 5];
  const users = [];

  await forEachAsync(userIds, async (id, index) => {
    console.log(`Fetching user ${id}...`);
    const user = await fetchUserData(id);
    users.push(user);
    console.log(`Fetched user ${id}: ${user.name} (score: ${user.score})`);
  });

  // Parallel processing with concurrency limit
  console.log('\n=== Parallel Processing ===');
  const moreUserIds = Array.from({ length: 20 }, (_, i) => i + 1);
  const parallelUsers = new Map();
  const startTime = Date.now();

  await forEachParallel(moreUserIds, async (id) => {
    const user = await fetchUserData(id);
    parallelUsers.set(id, user);
    console.log(`✓ User ${id} fetched`);
  }, { 
    concurrency: 5 // Process 5 users at a time
  });

  console.log(`Parallel processing took ${Date.now() - startTime}ms`);

  // Error handling in async iteration
  console.log('\n=== Async Error Handling ===');
  const problematicIds = [1, 2, 'invalid', 4, 5];
  const successfulUsers = [];

  await forEachAsync(problematicIds, async (id) => {
    try {
      if (id === 'invalid') {
        throw new Error('Invalid user ID');
      }
      const user = await fetchUserData(id);
      successfulUsers.push(user);
      console.log(`✓ Successfully processed user ${id}`);
    } catch (error) {
      console.error(`✗ Failed to process ID ${id}: ${error.message}`);
    }
  }, { 
    breakOnError: false // Continue even if errors occur
  });

  console.log(`\nSuccessfully processed ${successfulUsers.length} users`);

  // Timeout example
  console.log('\n=== Timeout Example ===');
  const slowOperation = async (value) => {
    const delayTime = value * 1000;
    console.log(`Starting operation ${value} (will take ${delayTime}ms)`);
    await delay(delayTime);
    return `Result ${value}`;
  };

  try {
    await forEachAsync([1, 2, 3], async (value) => {
      const result = await slowOperation(value);
      console.log(result);
    }, {
      timeout: 1500 // 1.5 second timeout per operation
    });
  } catch (error) {
    console.error('Operation timed out:', error.message);
  }

  // Preserve order in parallel execution
  console.log('\n=== Order Preservation ===');
  const orderedResults = [];
  
  await forEachParallel([3, 1, 4, 1, 5], async (value, index) => {
    await delay(value * 100); // Different delays
    orderedResults[index] = value * 2;
  }, {
    concurrency: 3,
    preserveOrder: true
  });

  console.log('Results in order:', orderedResults);
}

main().catch(console.error);