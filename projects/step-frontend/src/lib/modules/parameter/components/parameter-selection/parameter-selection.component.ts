import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import {
  AJS_MODULE,
  AutoDeselectStrategy,
  Parameter,
  selectionCollectionProvider,
  SelectionCollector,
  TableApiWrapperService,
  TableRemoteDataSource,
} from '@exense/step-core';

interface TableHandle {
  getSelectedIds?(): readonly string[];
}

@Component({
  selector: 'step-parameter-selection',
  templateUrl: './parameter-selection.component.html',
  styleUrls: ['./parameter-selection.component.scss'],
  providers: [selectionCollectionProvider<string, Parameter>('id', AutoDeselectStrategy.DESELECT_ON_UNREGISTER)],
})
export class ParameterSelectionComponent implements OnInit, OnDestroy {
  @Input() tableHandle!: TableHandle;

  readonly dataSource = new TableRemoteDataSource<Parameter>('parameters', this._tableApiWrapperService, {
    scope: 'scope',
  });

  constructor(
    private _tableApiWrapperService: TableApiWrapperService,
    private _selectionCollector: SelectionCollector<string, Parameter>
  ) {}

  ngOnInit() {
    this.initTableHandle();
  }

  ngOnDestroy(): void {
    this.cleanTableHandleUp();
  }

  private initTableHandle(): void {
    this.tableHandle.getSelectedIds = () => {
      return this._selectionCollector.selected;
    };
  }

  private cleanTableHandleUp(): void {
    delete this.tableHandle.getSelectedIds;
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive(
    'stepParameterSelection',
    downgradeComponent({
      component: ParameterSelectionComponent,
    })
  );
