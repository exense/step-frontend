import { inject, Injectable } from '@angular/core';
import { finalize, map, Observable, of, Subject, tap } from 'rxjs';
import { TimeSeriesUtilityService } from './time-series-utility.service';

@Injectable({
  providedIn: 'root',
})
export class TimeSeriesEntityService {
  private cache: Map<string, string> = new Map<string, string>();
  private ongoingRequests = new Map<string, Subject<Record<string, string>>>();

  private utilityService: TimeSeriesUtilityService = inject(TimeSeriesUtilityService);

  getEntityNames(ids: string[], type: string): Observable<Record<string, string>> {
    if (!ids || ids.length === 0) {
      return of({});
    }
    const cachedResults: { [key: string]: string } = {};
    const idsToFetch: string[] = [];
    console.log(this.cache);
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

      this.utilityService
        .getEntitiesNamesByIds(idsToFetch, type)
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
}
