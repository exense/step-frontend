import { Component, computed, signal } from '@angular/core';
import { CustomComponent } from '../../modules/custom-registeries/shared/custom-component';
import { ArtefactInlineItem } from './artefact-inline-item';
import { AggregatedArtefactInfo } from '../../shared';
import { Observable } from 'rxjs';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs/operators';

export interface InlineArtefactContext<T extends AggregatedArtefactInfo> {
  info: T;
  isVertical?: boolean;
}

@Component({
  template: '',
})
export abstract class BaseInlineArtefactComponent<T extends AggregatedArtefactInfo> implements CustomComponent {
  private contextInternal = signal<InlineArtefactContext<T> | undefined>(undefined);
  protected info = computed(() => this.contextInternal()?.info);
  protected isVertical = computed(() => !!this.contextInternal()?.isVertical);

  private context$ = toObservable(this.contextInternal);
  private items$ = this.context$.pipe(
    switchMap((context) => {
      const isResolved = this.isResolved(context?.info);
      return this.getArtefactItems(context?.info, context?.isVertical, isResolved);
    }),
    takeUntilDestroyed(),
  );

  protected items = toSignal(this.items$);

  context?: InlineArtefactContext<T>;

  contextChange(previousContext?: InlineArtefactContext<T>, currentContext?: InlineArtefactContext<T>) {
    this.contextInternal.set(currentContext);
  }

  protected abstract getArtefactItems(
    info?: T,
    isVertical?: boolean,
    isResolved?: boolean,
  ): Observable<ArtefactInlineItem[] | undefined>;

  private isResolved(info?: T): boolean {
    if (!info) {
      return false;
    }

    const statuses = new Set(Object.keys(info.countByStatus ?? {}));
    if (statuses.has('RUNNING')) {
      return false;
    }

    return true;
  }
}
