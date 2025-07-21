const { forEach } = require('@oxog/foreach');

// Basic array iteration
console.log('=== Basic Array Iteration ===');
const numbers = [1, 2, 3, 4, 5];

forEach(numbers, (value, index) => {
  console.log(`Index ${index}: ${value}`);
});

// Object iteration
console.log('\n=== Object Iteration ===');
const person = {
  name: 'John Doe',
  age: 30,
  city: 'New York',
  occupation: 'Developer'
};

forEach(person, (value, key) => {
  console.log(`${key}: ${value}`);
});

// Using options
console.log('\n=== Reverse Iteration ===');
forEach(['first', 'second', 'third', 'fourth'], (value, index) => {
  console.log(`${index}: ${value}`);
}, { reverse: true });

// Using thisArg
console.log('\n=== Using thisArg ===');
const formatter = {
  prefix: '> ',
  suffix: ' <',
  format: function(value) {
    return this.prefix + value + this.suffix;
  }
};

forEach(['apple', 'banana', 'orange'], function(fruit) {
  console.log(this.format(fruit));
}, { thisArg: formatter });

// Error handling
console.log('\n=== Error Handling ===');
const riskyData = [1, 2, 'error', 4, 5];

forEach(riskyData, (value) => {
  if (value === 'error') {
    throw new Error('Found error value!');
  }
  console.log(`Processing: ${value}`);
}, { breakOnError: false });

// Early termination
console.log('\n=== Early Termination ===');
forEach([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], (value) => {
  console.log(`Processing: ${value}`);
  if (value === 5) {
    return 'stop'; // This will break the loop
  }
}, { breakOnReturn: true });