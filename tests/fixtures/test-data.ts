export interface TestUser {
  id: number;
  name: string;
  email: string;
  active: boolean;
  role: 'admin' | 'user' | 'guest';
  metadata?: Record<string, any>;
}

export interface TestProduct {
  sku: string;
  name: string;
  price: number;
  stock: number;
  categories: string[];
}

export const TEST_USERS: TestUser[] = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    active: true,
    role: 'admin',
    metadata: { department: 'IT', level: 'senior' }
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    active: true,
    role: 'user',
    metadata: { department: 'Marketing', level: 'junior' }
  },
  {
    id: 3,
    name: 'Bob Johnson',
    email: 'bob@example.com',
    active: false,
    role: 'user',
    metadata: { department: 'Sales', level: 'senior' }
  },
  {
    id: 4,
    name: 'Alice Brown',
    email: 'alice@example.com',
    active: true,
    role: 'guest'
  },
  {
    id: 5,
    name: 'Charlie Wilson',
    email: 'charlie@example.com',
    active: true,
    role: 'admin',
    metadata: { department: 'IT', level: 'junior' }
  }
];

export const TEST_PRODUCTS: TestProduct[] = [
  {
    sku: 'LAPTOP-001',
    name: 'MacBook Pro 16"',
    price: 2499,
    stock: 15,
    categories: ['Electronics', 'Computers', 'Apple']
  },
  {
    sku: 'MOUSE-001',
    name: 'Logitech MX Master 3',
    price: 99,
    stock: 50,
    categories: ['Electronics', 'Accessories', 'Logitech']
  },
  {
    sku: 'KEYBOARD-001',
    name: 'Mechanical Keyboard RGB',
    price: 149,
    stock: 0,
    categories: ['Electronics', 'Accessories', 'Gaming']
  },
  {
    sku: 'MONITOR-001',
    name: '4K USB-C Monitor',
    price: 599,
    stock: 8,
    categories: ['Electronics', 'Monitors', 'Professional']
  },
  {
    sku: 'DESK-001',
    name: 'Standing Desk Electric',
    price: 799,
    stock: 12,
    categories: ['Furniture', 'Office', 'Ergonomic']
  }
];

export const LARGE_ARRAY = Array.from({ length: 10000 }, (_, i) => ({
  id: i,
  value: Math.floor(Math.random() * 1000),
  category: ['A', 'B', 'C', 'D'][i % 4],
  active: Math.random() > 0.3
}));

export const SPARSE_ARRAY = (() => {
  const arr = new Array(10);
  arr[0] = 'first';
  arr[2] = 'third';
  arr[5] = 'sixth';
  arr[9] = 'tenth';
  return arr;
})();

export const NESTED_OBJECT = {
  level1: {
    level2a: {
      level3: 'deep value 1',
      array: [1, 2, 3]
    },
    level2b: {
      level3: 'deep value 2',
      object: { nested: true }
    }
  },
  simple: 'simple value',
  array: ['a', 'b', 'c'],
  number: 42,
  boolean: true,
  null: null,
  undefined: undefined
};

export const CIRCULAR_OBJECT = (() => {
  const obj: any = {
    name: 'circular',
    data: { value: 123 }
  };
  obj.self = obj;
  obj.data.parent = obj;
  return obj;
})();

export function createAsyncData<T>(data: T[], delay: number = 10): Promise<T[]> {
  return new Promise(resolve => {
    setTimeout(() => resolve(data), delay);
  });
}

export function createAsyncIterator<T>(data: T[], delay: number = 10) {
  let index = 0;
  return {
    async next(): Promise<IteratorResult<T>> {
      if (index >= data.length) {
        return { done: true, value: undefined };
      }
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return { done: false, value: data[index++] };
    },
    [Symbol.asyncIterator]() {
      return this;
    }
  };
}

export function* generateTestData(count: number = 1000) {
  for (let i = 0; i < count; i++) {
    yield {
      id: i,
      timestamp: Date.now() + i,
      data: `item-${i}`,
      random: Math.random()
    };
  }
}

export const ERROR_SCENARIOS = {
  INVALID_TARGETS: [
    null,
    undefined,
    'string',
    123,
    true,
    Symbol('test'),
    () => {}
  ],
  INVALID_CALLBACKS: [
    null,
    undefined,
    'string',
    123,
    true,
    {},
    []
  ],
  INVALID_OPTIONS: [
    { breakOnError: 'true' },
    { reverse: 'false' },
    { concurrency: 0 },
    { concurrency: 1001 },
    { chunkSize: 0 },
    { bufferSize: -1 }
  ]
};

export const PERFORMANCE_TEST_DATA = {
  SMALL: Array.from({ length: 100 }, (_, i) => i),
  MEDIUM: Array.from({ length: 10000 }, (_, i) => i),
  LARGE: Array.from({ length: 100000 }, (_, i) => i),
  HUGE: Array.from({ length: 1000000 }, (_, i) => i)
};

export function createMockPlugin(name: string) {
  const calls: Array<{ method: string; args: any[] }> = [];
  
  return {
    name,
    version: '1.0.0',
    beforeIteration: (...args: any[]) => {
      calls.push({ method: 'beforeIteration', args });
    },
    afterIteration: (...args: any[]) => {
      calls.push({ method: 'afterIteration', args });
    },
    onError: (...args: any[]) => {
      calls.push({ method: 'onError', args });
    },
    getCalls: () => calls,
    reset: () => calls.length = 0
  };
}