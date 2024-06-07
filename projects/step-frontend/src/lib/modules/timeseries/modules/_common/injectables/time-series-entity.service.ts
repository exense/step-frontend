import { inject, Injectable } from '@angular/core';
import { finalize, map, Observable, of, Subject, tap } from 'rxjs';
import {
  AugmentedExecutionsService,
  Execution,
  ExecutiontTaskParameters,
  Plan,
  PlansService,
  SchedulerService,
} from '@exense/step-core';

@Injectable({
  providedIn: 'root',
})
export class TimeSeriesEntityService {
  private cache: Map<string, string> = new Map<string, string>();
  private ongoingRequests = new Map<string, Subject<Record<string, string>>>();

  private _executionService = inject(AugmentedExecutionsService);
  private _planService = inject(PlansService);
  private _schedulerService = inject(SchedulerService);

  clearCache() {
    this.cache.clear();
  }

  getEntityNames(ids: string[], type: string): Observable<Record<string, string>> {
    if (!ids || ids.length === 0) {
      return of({});
    }
    const cachedResults: { [key: string]: string } = {};
    const idsToFetch: string[] = [];
    // Separate cached IDs from those that need to be fetched
    ids.forEach((id) => {
      if (this.cache.has(id)) {
        cachedResults[id] = this.cache.get(id)!;
      } else {
        idsToFetch.push(id);
      }
    });

    if (idsToFetch.length === 0) {
      // All IDs are cached
      return of(cachedResults);
    }
    if (idsToFetch.length < 100) {
      // Make sure the request id is the same when sorting does not have a high complexity
      idsToFetch.sort();
    }

    const requestKey = idsToFetch.join(',');

    if (this.ongoingRequests.has(requestKey)) {
      // There is already an ongoing request for these IDs
      return this.ongoingRequests
        .get(requestKey)!
        .asObservable()
        .pipe(
          map((fetchedResults) => {
            return { ...cachedResults, ...fetchedResults };
          }),
        );
    } else {
      // Make a new request for the IDs that need to be fetched
      const subject = new Subject<{ [key: string]: string }>();

      this.ongoingRequests.set(requestKey, subject);

      this.getEntitiesNamesByIds(idsToFetch, type)
        .pipe(
          tap((fetchedResults) => {
            // Update the cache
            Object.keys(fetchedResults).forEach((id) => {
              this.cache.set(id, fetchedResults[id]);
            });
            subject.next(fetchedResults);
            subject.complete();
          }),
          finalize(() => {
            // Clean up the ongoing request cache
            this.ongoingRequests.delete(requestKey);
          }),
        )
        .subscribe();

      return subject.asObservable().pipe(
        map((fetchedResults) => {
          return { ...cachedResults, ...fetchedResults };
        }),
      );
    }
  }

  getEntitiesNamesByIds(ids: string[], entityType: string): Observable<Record<string, string>> {
    if (!ids || ids.length === 0) {
      return of({});
    }
    switch (entityType) {
      case 'execution':
        return this.getExecutionNames(ids);
      case 'plan':
        return this.getPlansNames(ids);
      case 'task':
        return this.getTasksNames(ids);
      default:
        throw new Error('Unhandled entity type: ' + entityType);
    }
  }

  private getExecutionNames(ids: string[]): Observable<Record<string, string>> {
    return this._executionService.getExecutionsNamesByIds(ids);
  }

  private getTasksNames(ids: string[]): Observable<Record<string, string>> {
    return this._schedulerService.findExecutionTaskNamesByIds(ids);
  }

  private getPlansNames(ids: string[]): Observable<Record<string, string>> {
    return this._planService.findPlanNamesByIds(ids);
  }

  getExecutions(ids: string[]): Observable<Execution[]> {
    return this._executionService.searchByIds(ids);
  }

  getPlans(ids: string[]): Observable<Plan[]> {
    return this._planService.findPlansByIds(ids);
  }

  getTasks(ids: string[]): Observable<ExecutiontTaskParameters[]> {
    return this._schedulerService.findExecutionTasksByIds(ids);
  }
}
