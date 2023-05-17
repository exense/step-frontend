import { Component, inject, Input, OnInit } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import {
  AJS_MODULE,
  AugmentedSchedulerService,
  AutoDeselectStrategy,
  ExecutiontTaskParameters,
  selectionCollectionProvider,
  SelectionCollector,
} from '@exense/step-core';

interface TableHandle {
  getSelectedIds?(): readonly string[];
}

@Component({
  selector: 'step-scheduler-task-selection',
  templateUrl: './scheduler-task-selection.component.html',
  styleUrls: ['./scheduler-task-selection.component.scss'],
  providers: [
    selectionCollectionProvider<string, ExecutiontTaskParameters>('id', AutoDeselectStrategy.DESELECT_ON_UNREGISTER),
  ],
})
export class SchedulerTaskSelectionComponent implements OnInit {
  @Input() tableHandle!: TableHandle;

  private _selectionCollector = inject<SelectionCollector<string, ExecutiontTaskParameters>>(SelectionCollector);
  readonly _dataSource = inject(AugmentedSchedulerService).createSelectionDataSource();

  ngOnInit() {
    this.initTableHandle();
  }

  ngOnDestroy(): void {
    this.cleanTableHandleUp();
  }

  private initTableHandle(): void {
    this.tableHandle.getSelectedIds = () => this._selectionCollector.selected;
  }

  private cleanTableHandleUp(): void {
    delete this.tableHandle.getSelectedIds;
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive(
    'stepSchedulerTaskSelection',
    downgradeComponent({
      component: SchedulerTaskSelectionComponent,
    })
  );
