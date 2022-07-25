import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PropertyAccessorService {
  setProperty<O extends Record<string, any>, V>(objectContainer: O, pathChain: string, value: V): void {
    const parts = pathChain.split('.');

    const targetContainer = parts.reduce((container, path, i, self) => {
      if (i === self.length - 1) {
        return container;
      }

      if (!container[path]) {
        container[path] = {};
      }

      return container[path];
    }, objectContainer as Record<string, any>);

    const targetProperty = parts[parts.length - 1];
    targetContainer[targetProperty] = value;
  }

  getProperty<O extends Record<string, any>, R>(objectContainer: O, pathChain: string): R | null {
    const parts = pathChain.split('.');

    const result = parts.reduce((container, path) => {
      if (!container?.[path]) {
        return null;
      }

      return container[path]!;
    }, objectContainer as Record<string, any> | null);

    return result as R | null;
  }
}
