import { inject, Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, map, Subject } from 'rxjs';
import { PlanContext, PlanContextApiService } from '@exense/step-core';

@Injectable()
export class PlanHistoryService implements OnDestroy {
  private _planEditorApi = inject(PlanContextApiService);

  private undoStackEntityId?: string;

  private redoStack$ = new BehaviorSubject<PlanContext[]>([]);
  private undoStack$ = new BehaviorSubject<PlanContext[]>([]);

  readonly hasRedo$ = this.redoStack$.pipe(map((history) => history.length > 0));
  readonly hasUndo$ = this.undoStack$.pipe(map((history) => history.length > 1));

  private planContextChangeInternal$ = new Subject<PlanContext>();
  readonly planContextChange$ = this.planContextChangeInternal$.asObservable();

  get hasRedo(): boolean {
    return this.redoStack$.value.length > 0;
  }

  get hasUndo(): boolean {
    return this.undoStack$.value.length > 1;
  }

  ngOnDestroy(): void {
    this.redoStack$.complete();
    this.undoStack$.complete();
    this.planContextChangeInternal$.complete();
  }

  init(contex: PlanContext): void {
    if (this.undoStackEntityId !== contex.id) {
      this.undoStackEntityId = contex.id;
      this.redoStack$.next([]);
      this.undoStack$.next([]);
    }
    if (this.undoStack$.value.length === 0) {
      this.addToHistory(contex);
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
    this.planContextChangeInternal$.next(result);
  }

  redo(): void {
    const redoHistory = [...this.redoStack$.value];
    if (redoHistory.length <= 0) {
      return;
    }
    const result = redoHistory.pop()!;
    this.redoStack$.next(redoHistory);
    this.addToHistory(result, true);
    this.planContextChangeInternal$.next(result);
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
    this.planContextChangeInternal$.next(result);
  }

  addToHistory(context: PlanContext, keepRedoStack: boolean = false): void {
    const backupContext = this._planEditorApi.createContextDuplicate(context);
    const history = [...this.undoStack$.value, backupContext];
    this.undoStack$.next(history);
    if (!keepRedoStack) {
      this.redoStack$.next([]);
    }
  }
}
