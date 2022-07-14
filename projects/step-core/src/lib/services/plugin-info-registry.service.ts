import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PluginInfoRegistryService {
  private _registeredPlugins = new Set<string>();

  register(...plugins: string[]): void {
    plugins.forEach((p) => this._registeredPlugins.add(p));
  }

  isRegistered(plugin: string): boolean {
    return this._registeredPlugins.has(plugin);
  }
}
