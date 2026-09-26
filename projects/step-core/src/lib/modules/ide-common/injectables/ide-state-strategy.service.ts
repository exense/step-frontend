import { computed, Injectable, signal } from '@angular/core';
import { IdeStateStrategy } from '../types/ide-state-strategy.interface';

@Injectable({ providedIn: 'root' })
export class IdeStateStrategyService implements IdeStateStrategy {
  private readonly strategy = signal<IdeStateStrategy | undefined>(undefined);

  readonly currentPackage = computed(() => {
    const selectedStrategy = this.strategy();
    const currentPackage = selectedStrategy?.currentPackage();
    return currentPackage;
  });

  readonly inProgress = computed(() => {
    const selectedStrategy = this.strategy();
    const inProgress = selectedStrategy?.inProgress();
    return inProgress ?? false;
  });

  useStrategy(strategy: IdeStateStrategy): void {
    this.strategy.set(strategy);
  }
}
