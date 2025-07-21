import type {
  IIterationPlugin,
  IIterationContext,
  IForEachCore,
} from '../types';
import { PluginError } from '../types/errors';
import { validatePlugin } from '../utils/validators';
import type { IPlugin, IPluginConfig, IPluginManager } from './interfaces';

class PluginImpl implements IPlugin {
  private _enabled: boolean;

  constructor(
    private readonly _plugin: IIterationPlugin,
    config: IPluginConfig = {}
  ) {
    this._enabled = config.autoEnable ?? true;
  }

  public get name(): string {
    return this._plugin.name;
  }

  public get version(): string {
    return this._plugin.version;
  }

  public get metadata() {
    return {
      name: this._plugin.name,
      version: this._plugin.version,
    };
  }

  public get enabled(): boolean {
    return this._enabled;
  }

  public enable(): void {
    this._enabled = true;
    this.onEnable?.();
  }

  public disable(): void {
    this._enabled = false;
    this.onDisable?.();
  }

  public beforeIteration(context: IIterationContext): void | Promise<void> {
    if (this._enabled && this._plugin.beforeIteration) {
      return this._plugin.beforeIteration(context);
    }
  }

  public afterIteration(context: IIterationContext): void | Promise<void> {
    if (this._enabled && this._plugin.afterIteration) {
      return this._plugin.afterIteration(context);
    }
  }

  public onError(error: Error, context: IIterationContext): void | Promise<void> {
    if (this._enabled && this._plugin.onError) {
      return this._plugin.onError(error, context);
    }
  }

  public onInstall(): void | Promise<void> {
    // Can be overridden by plugins
  }

  public onUninstall(): void | Promise<void> {
    // Can be overridden by plugins
  }

  public onEnable(): void | Promise<void> {
    // Can be overridden by plugins
  }

  public onDisable(): void | Promise<void> {
    // Can be overridden by plugins
  }
}

export class PluginManager implements IPluginManager {
  private readonly _plugins = new Map<string, PluginImpl>();
  private readonly _executionOrder: string[] = [];

  public register(plugin: IIterationPlugin, config?: IPluginConfig): void {
    validatePlugin(plugin);

    if (this._plugins.has(plugin.name) && !config?.allowOverride) {
      throw new PluginError(
        `Plugin "${plugin.name}" is already registered`,
        { pluginName: plugin.name }
      );
    }

    const pluginImpl = new PluginImpl(plugin, config);
    this._plugins.set(plugin.name, pluginImpl);

    if (!this._executionOrder.includes(plugin.name)) {
      this._executionOrder.push(plugin.name);
    }

    pluginImpl.onInstall?.();
  }

  public unregister(pluginName: string): boolean {
    const plugin = this._plugins.get(pluginName);
    if (!plugin) {
      return false;
    }

    plugin.onUninstall?.();
    this._plugins.delete(pluginName);

    const orderIndex = this._executionOrder.indexOf(pluginName);
    if (orderIndex !== -1) {
      this._executionOrder.splice(orderIndex, 1);
    }

    return true;
  }

  public get(pluginName: string): IPlugin | undefined {
    return this._plugins.get(pluginName);
  }

  public getAll(): ReadonlyArray<IPlugin> {
    return Array.from(this._plugins.values());
  }

  public enable(pluginName: string): void {
    const plugin = this._plugins.get(pluginName);
    if (!plugin) {
      throw new PluginError(
        `Plugin "${pluginName}" not found`,
        { pluginName }
      );
    }
    plugin.enable();
  }

  public disable(pluginName: string): void {
    const plugin = this._plugins.get(pluginName);
    if (!plugin) {
      throw new PluginError(
        `Plugin "${pluginName}" not found`,
        { pluginName }
      );
    }
    plugin.disable();
  }

  public isEnabled(pluginName: string): boolean {
    const plugin = this._plugins.get(pluginName);
    return plugin ? plugin.enabled : false;
  }

  public clear(): void {
    for (const plugin of this._plugins.values()) {
      plugin.onUninstall?.();
    }
    this._plugins.clear();
    this._executionOrder.length = 0;
  }

  public async executeBeforeIteration(context: IIterationContext): Promise<void> {
    for (const pluginName of this._executionOrder) {
      const plugin = this._plugins.get(pluginName);
      if (plugin && plugin.enabled) {
        try {
          await plugin.beforeIteration(context);
        } catch (error) {
          throw new PluginError(
            `Plugin "${pluginName}" error in beforeIteration`,
            { pluginName, hook: 'beforeIteration', error }
          );
        }
      }
    }
  }

  public async executeAfterIteration(context: IIterationContext): Promise<void> {
    for (const pluginName of this._executionOrder) {
      const plugin = this._plugins.get(pluginName);
      if (plugin && plugin.enabled) {
        try {
          await plugin.afterIteration(context);
        } catch (error) {
          throw new PluginError(
            `Plugin "${pluginName}" error in afterIteration`,
            { pluginName, hook: 'afterIteration', error }
          );
        }
      }
    }
  }

  public async executeOnError(error: Error, context: IIterationContext): Promise<void> {
    for (const pluginName of this._executionOrder) {
      const plugin = this._plugins.get(pluginName);
      if (plugin && plugin.enabled) {
        try {
          await plugin.onError(error, context);
        } catch (pluginError) {
          throw new PluginError(
            `Plugin "${pluginName}" error in onError`,
            { pluginName, hook: 'onError', originalError: error, pluginError }
          );
        }
      }
    }
  }
}

export class ForEachCore implements IForEachCore {
  private readonly _pluginManager = new PluginManager();

  public use(plugin: IIterationPlugin): void {
    this._pluginManager.register(plugin);
  }

  public remove(pluginName: string): boolean {
    return this._pluginManager.unregister(pluginName);
  }

  public getPlugins(): ReadonlyArray<IIterationPlugin> {
    return this._pluginManager.getAll();
  }

  protected get pluginManager(): PluginManager {
    return this._pluginManager;
  }
}