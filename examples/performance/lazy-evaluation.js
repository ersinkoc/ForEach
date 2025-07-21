const { forEachLazy, forEachGenerator } = require('@oxog/foreach');

console.log('=== Lazy Evaluation Examples ===\n');

// Basic lazy iteration
console.log('1. Basic Lazy Iteration:');
const numbers = Array.from({ length: 20 }, (_, i) => i + 1);

const evenSquares = forEachLazy(numbers)
  .filter(n => {
    console.log(`  Filtering ${n}`);
    return n % 2 === 0;
  })
  .map(n => {
    console.log(`  Mapping ${n} to ${n * n}`);
    return n * n;
  })
  .take(3)
  .toArray();

console.log('Result:', evenSquares);
console.log('Note: Only processed necessary items!\n');

// Complex data pipeline
console.log('2. Complex Data Pipeline:');
const products = [
  { id: 1, name: 'Laptop', price: 999, category: 'Electronics', inStock: true },
  { id: 2, name: 'Mouse', price: 25, category: 'Electronics', inStock: true },
  { id: 3, name: 'Keyboard', price: 75, category: 'Electronics', inStock: false },
  { id: 4, name: 'Monitor', price: 299, category: 'Electronics', inStock: true },
  { id: 5, name: 'Desk', price: 450, category: 'Furniture', inStock: true },
  { id: 6, name: 'Chair', price: 200, category: 'Furniture', inStock: true },
  { id: 7, name: 'Lamp', price: 50, category: 'Furniture', inStock: false },
];

const discountedElectronics = forEachLazy(products)
  .filter(p => p.inStock)
  .filter(p => p.category === 'Electronics')
  .map(p => ({
    ...p,
    discountPrice: p.price * 0.8,
    savings: p.price * 0.2
  }))
  .filter(p => p.savings > 20)
  .toArray();

console.log('Discounted electronics:', discountedElectronics);

// Infinite sequence (simulated)
console.log('\n3. Working with Large/Infinite Sequences:');
function* fibonacci() {
  let [a, b] = [0, 1];
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

// Take first 10 fibonacci numbers
const fibGen = fibonacci();
const first10Fibs = Array.from({ length: 10 }, () => fibGen.next().value);

const largeFibs = forEachLazy(first10Fibs)
  .skip(5)  // Skip first 5
  .filter(n => n > 10)
  .take(3)
  .toArray();

console.log('Large fibonacci numbers:', largeFibs);

// Using generator function directly
console.log('\n4. Using forEachGenerator:');
const data = { a: 1, b: 2, c: 3, d: 4, e: 5 };

console.log('Object entries:');
for (const [key, value] of forEachGenerator(data)) {
  console.log(`  ${key}: ${value}`);
}

console.log('\nReversed array:');
const reversed = [...forEachGenerator([1, 2, 3, 4, 5], { reverse: true })];
console.log('Reversed:', reversed);

// Performance comparison
console.log('\n5. Performance Comparison:');
const hugeArray = Array.from({ length: 1000000 }, (_, i) => i);

// Traditional approach (processes everything)
console.time('Traditional');
const traditional = hugeArray
  .filter(n => n % 2 === 0)
  .map(n => n * 2)
  .filter(n => n > 1000000)
  .slice(0, 5);
console.timeEnd('Traditional');

// Lazy approach (processes only what's needed)
console.time('Lazy');
const lazy = forEachLazy(hugeArray)
  .filter(n => n % 2 === 0)
  .map(n => n * 2)
  .filter(n => n > 1000000)
  .take(5)
  .toArray();
console.timeEnd('Lazy');

console.log('Traditional result:', traditional);
console.log('Lazy result:', lazy);
console.log('\nNote: Lazy evaluation is much faster for large datasets!');

// Chaining multiple operations
console.log('\n6. Complex Chaining:');
const complexResult = forEachLazy(Array.from({ length: 100 }, (_, i) => i))
  .filter(n => n % 3 === 0)      // Divisible by 3
  .map(n => n * n)                // Square them
  .filter(n => n < 1000)          // Less than 1000
  .skip(2)                        // Skip first 2
  .take(5)                        // Take next 5
  .map(n => `Number: ${n}`)       // Format as string
  .toArray();

console.log('Complex chain result:', complexResult);

// Working with objects
console.log('\n7. Lazy Object Iteration:');
const inventory = {
  laptop: { price: 999, stock: 5 },
  mouse: { price: 25, stock: 50 },
  keyboard: { price: 75, stock: 0 },
  monitor: { price: 299, stock: 8 },
  webcam: { price: 89, stock: 0 },
  headphones: { price: 149, stock: 15 }
};

const availableItems = forEachLazy(inventory)
  .filter(([_, item]) => item.stock > 0)
  .map(([name, item]) => ({
    name,
    totalValue: item.price * item.stock
  }))
  .filter(item => item.totalValue > 500)
  .toArray();

console.log('High-value inventory items:', availableItems);