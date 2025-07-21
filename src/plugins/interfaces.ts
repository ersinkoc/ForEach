import type { IIterationContext, IIterationPlugin } from '../types';

export interface IPluginHooks {
  beforeIteration?: (context: IIterationContext) => void | Promise<void>;
  afterIteration?: (context: IIterationContext) => void | Promise<void>;
  onError?: (error: Error, context: IIterationContext) => void | Promise<void>;
}

export interface IPluginMetadata {
  readonly name: string;
  readonly version: string;
  readonly description?: string;
  readonly author?: string;
  readonly dependencies?: string[];
}

export interface IPluginLifecycle {
  onInstall?(): void | Promise<void>;
  onUninstall?(): void | Promise<void>;
  onEnable?(): void | Promise<void>;
  onDisable?(): void | Promise<void>;
}

export interface IPlugin extends IIterationPlugin, IPluginLifecycle {
  readonly metadata: IPluginMetadata;
  readonly enabled: boolean;
}

export interface IPluginConfig {
  readonly autoEnable?: boolean;
  readonly priority?: number;
  readonly allowOverride?: boolean;
}

export interface IPluginManager {
  register(plugin: IIterationPlugin, config?: IPluginConfig): void;
  unregister(pluginName: string): boolean;
  get(pluginName: string): IPlugin | undefined;
  getAll(): ReadonlyArray<IPlugin>;
  enable(pluginName: string): void;
  disable(pluginName: string): void;
  isEnabled(pluginName: string): boolean;
  clear(): void;
}