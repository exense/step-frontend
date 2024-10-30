import { Component, computed, signal } from '@angular/core';
import { CustomComponent } from '../../modules/custom-registeries/shared/custom-component';
import { ArtefactInlineItem } from './artefact-inline-item';
import { AggregatedArtefactInfo } from '../../shared';
import { Observable } from 'rxjs';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs/operators';

@Component({
  template: '',
})
export abstract class BaseInlineArtefactComponent<T extends AggregatedArtefactInfo> implements CustomComponent {
  private infoInternal = signal<T | undefined>(undefined);
  protected info = this.infoInternal.asReadonly();

  private info$ = toObservable(this.info);
  private items$ = this.info$.pipe(
    switchMap((info) => {
      const isResolved = this.isResolved(info);
      return this.getArtefactItems(info, isResolved);
    }),
    takeUntilDestroyed(),
  );

  protected items = toSignal(this.items$);

  context?: T;

  contextChange(previousContext?: T, currentContext?: T) {
    this.infoInternal.set(currentContext);
  }

  protected abstract getArtefactItems(info?: T, isResolved?: boolean): Observable<ArtefactInlineItem[] | undefined>;

  private isResolved(info?: T): boolean {
    if (!info) {
      return false;
    }

    const statuses = new Set(Object.keys(info.countByStatus ?? {}));
    if (statuses.has('RUNNING')) {
      return false;
    }

    const count = Object.values(info.countByStatus ?? {}).reduce((res, item) => res + item, 0);
    return count === 1;
  }
}
