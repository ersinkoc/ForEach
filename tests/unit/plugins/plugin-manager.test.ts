import { ForEachCore, PluginManager } from '../../../src/plugins/plugin-manager';
import { PluginError } from '../../../src/types/errors';
import type { IIterationContext, IIterationPlugin } from '../../../src/types';

describe('PluginManager', () => {
  let manager: PluginManager;

  beforeEach(() => {
    manager = new PluginManager();
  });

  describe('Plugin registration', () => {
    it('should register a valid plugin', () => {
      const plugin: IIterationPlugin = {
        name: 'test-plugin',
        version: '1.0.0',
      };

      manager.register(plugin);
      expect(manager.get('test-plugin')).toBeDefined();
    });

    it('should validate plugin on registration', () => {
      expect(() => {
        manager.register({ name: '', version: '1.0.0' });
      }).toThrow();

      expect(() => {
        manager.register({ name: 'test', version: '' });
      }).toThrow();
    });

    it('should prevent duplicate registration by default', () => {
      const plugin: IIterationPlugin = {
        name: 'test-plugin',
        version: '1.0.0',
      };

      manager.register(plugin);
      
      expect(() => {
        manager.register(plugin);
      }).toThrow(PluginError);
    });

    it('should allow override when specified', () => {
      const plugin1: IIterationPlugin = {
        name: 'test-plugin',
        version: '1.0.0',
      };

      const plugin2: IIterationPlugin = {
        name: 'test-plugin',
        version: '2.0.0',
      };

      manager.register(plugin1);
      manager.register(plugin2, { allowOverride: true });

      const registered = manager.get('test-plugin');
      expect(registered?.version).toBe('2.0.0');
    });

    it('should auto-enable plugins by default', () => {
      const plugin: IIterationPlugin = {
        name: 'test-plugin',
        version: '1.0.0',
      };

      manager.register(plugin);
      expect(manager.isEnabled('test-plugin')).toBe(true);
    });

    it('should respect autoEnable option', () => {
      const plugin: IIterationPlugin = {
        name: 'test-plugin',
        version: '1.0.0',
      };

      manager.register(plugin, { autoEnable: false });
      expect(manager.isEnabled('test-plugin')).toBe(false);
    });
  });

  describe('Plugin unregistration', () => {
    it('should unregister existing plugin', () => {
      const plugin: IIterationPlugin = {
        name: 'test-plugin',
        version: '1.0.0',
      };

      manager.register(plugin);
      const result = manager.unregister('test-plugin');

      expect(result).toBe(true);
      expect(manager.get('test-plugin')).toBeUndefined();
    });

    it('should return false for non-existent plugin', () => {
      const result = manager.unregister('non-existent');
      expect(result).toBe(false);
    });

    it('should call onUninstall hook', () => {
      const onUninstall = jest.fn();
      const plugin: IIterationPlugin = {
        name: 'test-plugin',
        version: '1.0.0',
      };

      manager.register(plugin);
      const registeredPlugin = manager.get('test-plugin') as any;
      registeredPlugin.onUninstall = onUninstall;

      manager.unregister('test-plugin');
      expect(onUninstall).toHaveBeenCalled();
    });
  });

  describe('Plugin enable/disable', () => {
    it('should enable disabled plugin', () => {
      const plugin: IIterationPlugin = {
        name: 'test-plugin',
        version: '1.0.0',
      };

      manager.register(plugin, { autoEnable: false });
      expect(manager.isEnabled('test-plugin')).toBe(false);

      manager.enable('test-plugin');
      expect(manager.isEnabled('test-plugin')).toBe(true);
    });

    it('should disable enabled plugin', () => {
      const plugin: IIterationPlugin = {
        name: 'test-plugin',
        version: '1.0.0',
      };

      manager.register(plugin);
      expect(manager.isEnabled('test-plugin')).toBe(true);

      manager.disable('test-plugin');
      expect(manager.isEnabled('test-plugin')).toBe(false);
    });

    it('should throw for non-existent plugin', () => {
      expect(() => {
        manager.enable('non-existent');
      }).toThrow(PluginError);

      expect(() => {
        manager.disable('non-existent');
      }).toThrow(PluginError);
    });
  });

  describe('Plugin execution', () => {
    it('should execute beforeIteration hooks', async () => {
      const beforeIteration = jest.fn();
      const plugin: IIterationPlugin = {
        name: 'test-plugin',
        version: '1.0.0',
        beforeIteration,
      };

      manager.register(plugin);

      const context: IIterationContext = {
        index: 0,
        total: 10,
        isFirst: true,
        isLast: false,
        break: jest.fn(),
        skip: jest.fn(),
      };

      await manager.executeBeforeIteration(context);
      expect(beforeIteration).toHaveBeenCalledWith(context);
    });

    it('should execute afterIteration hooks', async () => {
      const afterIteration = jest.fn();
      const plugin: IIterationPlugin = {
        name: 'test-plugin',
        version: '1.0.0',
        afterIteration,
      };

      manager.register(plugin);

      const context: IIterationContext = {
        index: 0,
        total: 10,
        isFirst: true,
        isLast: false,
        break: jest.fn(),
        skip: jest.fn(),
      };

      await manager.executeAfterIteration(context);
      expect(afterIteration).toHaveBeenCalledWith(context);
    });

    it('should execute onError hooks', async () => {
      const onError = jest.fn();
      const plugin: IIterationPlugin = {
        name: 'test-plugin',
        version: '1.0.0',
        onError,
      };

      manager.register(plugin);

      const error = new Error('Test error');
      const context: IIterationContext = {
        index: 0,
        total: 10,
        isFirst: true,
        isLast: false,
        break: jest.fn(),
        skip: jest.fn(),
      };

      await manager.executeOnError(error, context);
      expect(onError).toHaveBeenCalledWith(error, context);
    });

    it('should skip disabled plugins', async () => {
      const beforeIteration = jest.fn();
      const plugin: IIterationPlugin = {
        name: 'test-plugin',
        version: '1.0.0',
        beforeIteration,
      };

      manager.register(plugin);
      manager.disable('test-plugin');

      const context: IIterationContext = {
        index: 0,
        total: 10,
        isFirst: true,
        isLast: false,
        break: jest.fn(),
        skip: jest.fn(),
      };

      await manager.executeBeforeIteration(context);
      expect(beforeIteration).not.toHaveBeenCalled();
    });

    it('should execute plugins in order', async () => {
      const order: string[] = [];

      const plugin1: IIterationPlugin = {
        name: 'plugin-1',
        version: '1.0.0',
        beforeIteration: () => { order.push('plugin-1'); },
      };

      const plugin2: IIterationPlugin = {
        name: 'plugin-2',
        version: '1.0.0',
        beforeIteration: () => { order.push('plugin-2'); },
      };

      const plugin3: IIterationPlugin = {
        name: 'plugin-3',
        version: '1.0.0',
        beforeIteration: () => { order.push('plugin-3'); },
      };

      manager.register(plugin1);
      manager.register(plugin2);
      manager.register(plugin3);

      const context: IIterationContext = {
        index: 0,
        total: 1,
        isFirst: true,
        isLast: true,
        break: jest.fn(),
        skip: jest.fn(),
      };

      await manager.executeBeforeIteration(context);
      expect(order).toEqual(['plugin-1', 'plugin-2', 'plugin-3']);
    });

    it('should handle errors in plugin hooks', async () => {
      const plugin: IIterationPlugin = {
        name: 'error-plugin',
        version: '1.0.0',
        beforeIteration: () => {
          throw new Error('Hook error');
        },
      };

      manager.register(plugin);

      const context: IIterationContext = {
        index: 0,
        total: 1,
        isFirst: true,
        isLast: true,
        break: jest.fn(),
        skip: jest.fn(),
      };

      await expect(
        manager.executeBeforeIteration(context)
      ).rejects.toThrow(PluginError);
    });
  });

  describe('Plugin management', () => {
    it('should get all plugins', () => {
      const plugin1: IIterationPlugin = {
        name: 'plugin-1',
        version: '1.0.0',
      };

      const plugin2: IIterationPlugin = {
        name: 'plugin-2',
        version: '1.0.0',
      };

      manager.register(plugin1);
      manager.register(plugin2);

      const all = manager.getAll();
      expect(all).toHaveLength(2);
      expect(all.map(p => p.name).sort()).toEqual(['plugin-1', 'plugin-2']);
    });

    it('should clear all plugins', () => {
      const plugin1: IIterationPlugin = {
        name: 'plugin-1',
        version: '1.0.0',
      };

      const plugin2: IIterationPlugin = {
        name: 'plugin-2',
        version: '1.0.0',
      };

      manager.register(plugin1);
      manager.register(plugin2);

      manager.clear();

      expect(manager.getAll()).toHaveLength(0);
      expect(manager.get('plugin-1')).toBeUndefined();
      expect(manager.get('plugin-2')).toBeUndefined();
    });
  });
});

describe('ForEachCore', () => {
  let core: ForEachCore;

  beforeEach(() => {
    core = new ForEachCore();
  });

  it('should use plugins', () => {
    const plugin: IIterationPlugin = {
      name: 'test-plugin',
      version: '1.0.0',
    };

    core.use(plugin);
    expect(core.getPlugins()).toHaveLength(1);
  });

  it('should remove plugins', () => {
    const plugin: IIterationPlugin = {
      name: 'test-plugin',
      version: '1.0.0',
    };

    core.use(plugin);
    const removed = core.remove('test-plugin');

    expect(removed).toBe(true);
    expect(core.getPlugins()).toHaveLength(0);
  });

  it('should get all plugins', () => {
    const plugin1: IIterationPlugin = {
      name: 'plugin-1',
      version: '1.0.0',
    };

    const plugin2: IIterationPlugin = {
      name: 'plugin-2',
      version: '1.0.0',
    };

    core.use(plugin1);
    core.use(plugin2);

    const plugins = core.getPlugins();
    expect(plugins).toHaveLength(2);
    expect(plugins.map(p => p.name).sort()).toEqual(['plugin-1', 'plugin-2']);
  });
});