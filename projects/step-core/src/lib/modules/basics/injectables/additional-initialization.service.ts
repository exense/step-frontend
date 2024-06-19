import { Injectable } from '@angular/core';
import { forkJoin, map, Observable, of, shareReplay, tap } from 'rxjs';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

export type InitializationStep = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => Observable<boolean>;

@Injectable({
  providedIn: 'root',
})
export class AdditionalInitializationService {
  private initializationSteps: InitializationStep[] = [];

  private initialized$?: Observable<boolean>;

  registerInitializationStep(step: InitializationStep): this {
    this.initializationSteps.push(step);
    return this;
  }

  initialize(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    if (this.initialized$) {
      return this.initialized$;
    }

    if (!this.initializationSteps.length) {
      this.initialized$ = of(true);
      return this.initialized$;
    }

    const runningSteps = this.initializationSteps.map((step) => step(route, state));
    this.initialized$ = forkJoin(runningSteps).pipe(
      map((initializeResults) => initializeResults.every((item) => !!item)),
      shareReplay(1),
    );
    return this.initialized$;
  }
}
