import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { AltExecutionRefreshActivity } from '../shared/alt-execution-refresh-activity.enum';

@Injectable()
export class AltExecutionRefreshActivityService implements OnDestroy {
  private readonly refreshActivityState$ = new BehaviorSubject<Set<AltExecutionRefreshActivity>>(new Set());

  ngOnDestroy(): void {
    this.refreshActivityState$.complete();
  }

  setupRefreshActivity(...activities: AltExecutionRefreshActivity[]): void {
    this.refreshActivityState$.next(new Set(activities));
  }

  isActive$(activity: AltExecutionRefreshActivity): Observable<boolean> {
    return this.refreshActivityState$.pipe(map((activityState) => activityState.has(activity)));
  }
}
