import { InjectionToken } from '@angular/core';
import { MemoryStorage } from './memory-storage';

export const LOCAL_STORAGE = new InjectionToken<Storage>('Local Storage', {
  providedIn: 'root',
  factory: () => localStorage,
});

export const SESSION_STORAGE = new InjectionToken<Storage>('Session Storage', {
  providedIn: 'root',
  factory: () => sessionStorage,
});

export const MEMORY_STORAGE = new InjectionToken<Storage>('In memory storage', {
  providedIn: 'root',
  factory: () => new MemoryStorage(),
});
