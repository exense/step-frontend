import { Component, Input, OnInit } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import {
  AJS_MODULE,
  AutoDeselectStrategy,
  FunctionPackage,
  Resource,
  selectionCollectionProvider,
  SelectionCollector,
  TableApiWrapperService,
  TableRemoteDataSource,
} from '@exense/step-core';

interface TableHandle {
  getSelectedIds?(): readonly string[];
}

@Component({
  selector: 'step-resource-selection',
  templateUrl: './resource-selection.component.html',
  styleUrls: ['./resource-selection.component.scss'],
  providers: [selectionCollectionProvider<string, Resource>('id', AutoDeselectStrategy.DESELECT_ON_UNREGISTER)],
})
export class ResourceSelectionComponent implements OnInit {
  @Input() tableHandle!: TableHandle;

  readonly dataSource = new TableRemoteDataSource<Resource>('resources', this._tableApiWrapperService, {
    id: 'id',
    resourceName: 'resourceName',
    resourceType: 'resourceType',
  });

  constructor(
    private _tableApiWrapperService: TableApiWrapperService,
    private _selectionCollector: SelectionCollector<string, FunctionPackage>
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
    'stepResourceSelection',
    downgradeComponent({
      component: ResourceSelectionComponent,
    })
  );
