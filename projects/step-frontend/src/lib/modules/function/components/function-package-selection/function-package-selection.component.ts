import { Component, Input, OnInit } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import {
  AJS_MODULE,
  AutoDeselectStrategy,
  FunctionPackage,
  selectionCollectionProvider,
  SelectionCollector,
  TableApiWrapperService,
  TableRemoteDataSource,
} from '@exense/step-core';

interface TableHandle {
  getSelectedIds?(): readonly string[];
}

@Component({
  selector: 'step-function-package-selection',
  templateUrl: 'function-package-selection.component.html',
  styleUrls: ['./function-package-selection.component.scss'],
  providers: [selectionCollectionProvider<string, FunctionPackage>('id', AutoDeselectStrategy.DESELECT_ON_UNREGISTER)],
})
export class FunctionPackageSelectionComponent implements OnInit {
  @Input() tableHandle!: TableHandle;

  readonly dataSource = new TableRemoteDataSource<FunctionPackage>('functionPackage', this._tableApiWrapperService, {
    'attributes.name': 'attributes.name',
    packageLocation: 'packageLocation',
    'packageAttributes.version': 'packageAttributes.version',
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
    'stepFunctionPackageSelection',
    downgradeComponent({
      component: FunctionPackageSelectionComponent,
    })
  );
