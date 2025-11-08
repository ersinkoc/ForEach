import {
  forEach,
  forEachAsync,
  forEachChunked,
  ForEachCore,
  forEachLazy,
  forEachParallel,
  type IAsyncForEachOptions,
  type IForEachOptions,
  type IIterationContext,
  type IIterationPlugin,
} from '@oxog/foreach';

// Define strongly typed data structures
interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  active: boolean;
}

interface Product {
  sku: string;
  name: string;
  price: number;
  stock: number;
  categories: string[];
}

// Type-safe iteration examples
async function examples() {
  // 1. Basic type-safe iteration
  const users: User[] = [
    { id: 1, name: 'John', email: 'john@example.com', role: 'admin', active: true },
    { id: 2, name: 'Jane', email: 'jane@example.com', role: 'user', active: true },
    { id: 3, name: 'Bob', email: 'bob@example.com', role: 'guest', active: false },
  ];

  // TypeScript infers types correctly
  forEach(users, (user, index, array) => {
    // user is typed as User
    // index is typed as number
    // array is typed as User[]
    console.log(`${user.name} (${user.role})`);
  });

  // 2. Object iteration with type inference
  const userMap: Record<string, User> = {
    john: users[0]!,
    jane: users[1]!,
    bob: users[2]!,
  };

  forEach(userMap, (user, key, obj) => {
    // user is typed as User
    // key is typed as string
    // obj is typed as Record<string, User>
    if (user.active) {
      console.log(`${key}: ${user.email}`);
    }
  });

  // 3. Async operations with proper typing
  const fetchUser = async (id: number): Promise<User | null> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 100));
    return users.find(u => u.id === id) || null;
  };

  const userIds = [1, 2, 3, 4, 5];
  const fetchedUsers: User[] = [];

  await forEachAsync(userIds, async (id) => {
    const user = await fetchUser(id);
    if (user) {
      fetchedUsers.push(user);
    }
  });

  // 4. Lazy evaluation with type transformations
  const products: Product[] = [
    { sku: 'LAPTOP-01', name: 'Laptop Pro', price: 1299, stock: 5, categories: ['Electronics', 'Computers'] },
    { sku: 'MOUSE-01', name: 'Wireless Mouse', price: 29, stock: 50, categories: ['Electronics', 'Accessories'] },
    { sku: 'DESK-01', name: 'Standing Desk', price: 599, stock: 10, categories: ['Furniture', 'Office'] },
  ];

  interface ProductSummary {
    sku: string;
    name: string;
    totalValue: number;
    isElectronics: boolean;
  }

  const productSummaries: ProductSummary[] = forEachLazy(products)
    .filter(p => p.stock > 0)
    .map(p => ({
      sku: p.sku,
      name: p.name,
      totalValue: p.price * p.stock,
      isElectronics: p.categories.includes('Electronics')
    }))
    .filter(p => p.totalValue > 1000)
    .toArray();

  console.log('High-value products:', productSummaries);

  // 5. Generic function with forEach
  function processCollection<T>(
    items: T[],
    predicate: (item: T) => boolean,
    transform: (item: T) => string
  ): string[] {
    const results: string[] = [];
    
    forEach(items, (item) => {
      if (predicate(item)) {
        results.push(transform(item));
      }
    });
    
    return results;
  }

  const activeUserNames = processCollection(
    users,
    user => user.active,
    user => user.name.toUpperCase()
  );

  // 6. Custom plugin with proper typing
  class MetricsPlugin implements IIterationPlugin {
    name = 'metrics' as const;
    version = '1.0.0' as const;
    
    private metrics = new Map<string, number>();

    beforeIteration(context: IIterationContext): void {
      const key = `item_${context.index}`;
      this.metrics.set(key, Date.now());
    }

    afterIteration(context: IIterationContext): void {
      const key = `item_${context.index}`;
      const startTime = this.metrics.get(key);
      if (startTime) {
        const duration = Date.now() - startTime;
        console.log(`Item ${context.index} took ${duration}ms`);
        this.metrics.delete(key);
      }
    }

    onError(error: Error, context: IIterationContext): void {
      console.error(`Error at index ${context.index}:`, error.message);
    }
  }

  // Use the plugin
  const core = new ForEachCore();
  core.use(new MetricsPlugin());

  // 7. Advanced options with strict typing
  const strictOptions: IAsyncForEachOptions = {
    concurrency: 5,
    timeout: 5000,
    preserveOrder: true,
    breakOnError: false,
    thisArg: { prefix: '>' }
  };

  await forEachParallel(userIds, async function(this: { prefix: string }, id) {
    console.log(`${this.prefix} Processing user ${id}`);
    await fetchUser(id);
  }, strictOptions);

  // 8. Discriminated unions and conditional types
  type DataItem = 
    | { type: 'user'; data: User }
    | { type: 'product'; data: Product };

  const mixedData: DataItem[] = [
    { type: 'user', data: users[0]! },
    { type: 'product', data: products[0]! },
    { type: 'user', data: users[1]! },
  ];

  forEach(mixedData, (item) => {
    switch (item.type) {
      case 'user':
        // TypeScript knows item.data is User here
        console.log(`User: ${item.data.name}`);
        break;
      case 'product':
        // TypeScript knows item.data is Product here
        console.log(`Product: ${item.data.sku}`);
        break;
    }
  });

  // 9. Const assertions and literal types
  const STATUS = {
    PENDING: 'pending',
    ACTIVE: 'active',
    INACTIVE: 'inactive'
  } as const;

  type Status = typeof STATUS[keyof typeof STATUS];

  interface Task {
    id: string;
    status: Status;
  }

  const tasks: Task[] = [
    { id: '1', status: STATUS.PENDING },
    { id: '2', status: STATUS.ACTIVE },
    { id: '3', status: STATUS.INACTIVE },
  ];

  // Group by status
  const grouped = new Map<Status, Task[]>();
  
  forEach(tasks, (task) => {
    const group = grouped.get(task.status) || [];
    group.push(task);
    grouped.set(task.status, group);
  });
}

// Run examples
examples().catch(console.error);