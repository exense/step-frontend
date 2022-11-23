import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class InsertPotentialParentStateService implements OnDestroy {
  private internalPotentialParentId$ = new BehaviorSubject<string | undefined>(undefined);

  readonly potentialParentId$ = this.internalPotentialParentId$.asObservable();

  updatePotentialParentId(id?: string): void {
    this.internalPotentialParentId$.next(id);
  }

  ngOnDestroy(): void {
    this.internalPotentialParentId$.complete();
  }
}
