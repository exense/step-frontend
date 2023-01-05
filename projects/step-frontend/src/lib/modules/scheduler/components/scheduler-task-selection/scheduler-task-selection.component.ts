import { Component, Input, OnInit } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import {
  AJS_MODULE,
  AutoDeselectStrategy,
  ExecutiontTaskParameters,
  selectionCollectionProvider,
  SelectionCollector,
  TableApiWrapperService,
  TableRemoteDataSource,
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

  readonly dataSource = new TableRemoteDataSource<ExecutiontTaskParameters>('tasks', this._tableApiWrapperService, {
    'attributes.name': 'attributes.name',
    'executionsParameters.customParameters.env': 'executionsParameters.customParameters.env',
    cronExpression: 'cronExpression',
  });

  constructor(
    private _tableApiWrapperService: TableApiWrapperService,
    private _selectionCollector: SelectionCollector<string, ExecutiontTaskParameters>
  ) {}

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
