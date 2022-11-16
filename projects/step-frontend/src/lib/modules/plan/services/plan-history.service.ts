import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, map, Subject } from 'rxjs';
import { Plan } from '@exense/step-core';

@Injectable()
export class PlanHistoryService implements OnDestroy {
  private undoStackEntityId?: string;

  private redoStack$ = new BehaviorSubject<Plan[]>([]);
  private undoStack$ = new BehaviorSubject<Plan[]>([]);

  readonly hasRedo$ = this.redoStack$.pipe(map((history) => history.length > 0));
  readonly hasUndo$ = this.undoStack$.pipe(map((history) => history.length > 1));

  private planChangeInternal$ = new Subject<Plan>();
  readonly planChange$ = this.planChangeInternal$.asObservable();

  get hasRedo(): boolean {
    return this.redoStack$.value.length > 0;
  }

  get hasUndo(): boolean {
    return this.undoStack$.value.length > 1;
  }

  ngOnDestroy(): void {
    this.redoStack$.complete();
    this.undoStack$.complete();
    this.planChangeInternal$.complete();
  }

  init(plan: Plan): void {
    if (this.undoStackEntityId !== plan.id) {
      this.undoStackEntityId = plan.id;
      this.redoStack$.next([]);
      this.undoStack$.next([]);
    }
    if (this.undoStack$.value.length === 0) {
      this.addToHistory(plan);
    }
  }

  undo(): void {
    const history = [...this.undoStack$.value];
    if (history.length <= 1) {
      return;
    }
    const toRedo = history.pop()!;
    const result = history.pop()!;

    this.undoStack$.next(history);
    this.redoStack$.next([...this.redoStack$.value, toRedo]);
    this.addToHistory(result, true);
    this.planChangeInternal$.next(result);
  }

  redo(): void {
    const redoHistory = [...this.redoStack$.value];
    if (redoHistory.length <= 0) {
      return;
    }
    const result = redoHistory.pop()!;
    this.redoStack$.next(redoHistory);
    this.addToHistory(result, true);
    this.planChangeInternal$.next(result);
  }

  discardAll(): void {
    const history = [...this.undoStack$.value];
    if (history.length === 0) {
      return;
    }
    this.undoStack$.next([]);
    const [result, ...otherHistory] = history;
    otherHistory.reverse();
    this.redoStack$.next([...this.redoStack$.value, ...otherHistory]);
    this.addToHistory(result, true);
    this.planChangeInternal$.next(result);
  }

  addToHistory(plan: Plan, keepRedoStack: boolean = false): void {
    const backupPlan = this.copyPlan(plan);
    const history = [...this.undoStack$.value, backupPlan];
    this.undoStack$.next(history);
    if (!keepRedoStack) {
      this.redoStack$.next([]);
    }
  }

  private copyPlan(plan: Plan): Plan {
    return JSON.parse(JSON.stringify(plan)) as Plan;
  }
}
