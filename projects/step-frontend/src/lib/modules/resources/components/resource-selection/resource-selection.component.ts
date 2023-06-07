import { Component, inject, Input, OnInit } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import {
  AJS_MODULE,
  AugmentedResourcesService,
  AutoDeselectStrategy,
  FunctionPackage,
  Resource,
  selectionCollectionProvider,
  SelectionCollector,
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

  private _selectionCollector = inject<SelectionCollector<string, FunctionPackage>>(SelectionCollector);
  readonly _dataSource = inject(AugmentedResourcesService).createSelectionDataSource();

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
