import { Component, computed, DestroyRef, inject, input, OnInit, output, ViewEncapsulation } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { NavigationStart, Router } from '@angular/router';
import { filter, map, of, switchMap } from 'rxjs';
import { AugmentedAutomationPackagesService, AutomationPackage } from '../../../../client/step-client-module';
import { TableFetchLocalDataSource, TableModule } from '../../../table/table.module';
import { EntityModule } from '../../../entity/entity.module';
import { StepBasicsModule } from '../../../basics/step-basics.module';

@Component({
  selector: 'step-automation-packages-used-by-resource-list',
  imports: [TableModule, EntityModule, StepBasicsModule],
  templateUrl: './automation-packages-used-by-resource-list.component.html',
  styleUrl: './automation-packages-used-by-resource-list.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class AutomationPackagesUsedByResourceListComponent implements OnInit {
  private _api = inject(AugmentedAutomationPackagesService);
  private _router = inject(Router);
  private _destroyRef = inject(DestroyRef);

  readonly resourceId = input<string>('');
  readonly close = output<void>();

  protected readonly dataSource = computed(() => {
    const resourceId = this.resourceId();
    if (!resourceId) {
      return undefined;
    }
    return new TableFetchLocalDataSource(
      () => this._api.getLinkedAutomationPackagesForResource(resourceId),
      TableFetchLocalDataSource.configBuilder<AutomationPackage>()
        .addSortStringPredicate('name', (item) => item.attributes?.['name'] ?? '')
        .build(),
    );
  });

  private isEmpty$ = toObservable(this.dataSource).pipe(
    switchMap((ds) => {
      if (!ds) {
        return of(0);
      }
      return ds.totalFiltered$;
    }),
    map((total) => total === 0),
  );

  protected readonly isEmpty = toSignal(this.isEmpty$, { initialValue: false });

  ngOnInit(): void {
    this.setupCloseOnNavigation();
  }

  private setupCloseOnNavigation(): void {
    this._router.events
      .pipe(
        filter((event) => event instanceof NavigationStart),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe(() => this.close.emit());
  }
}
