import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { TableComponent } from '../../../table/table.module';
import { CustomComponent } from '../../../custom-registeries/custom-registries.module';
import { SelectionCollector } from '../../../entities-selection/entities-selection.module';
import { SelectEntityContext } from '../../types/select-entity-context.interface';

@Component({
  selector: '',
  template: '',
  styleUrls: [],
})
export abstract class BaseEntitySelectionTableComponent implements AfterViewInit, CustomComponent, OnDestroy {
  private requireInitialSearch = false;

  protected multipleSelection?: boolean;
  protected abstract _tableRef?: TableComponent<any>;
  protected abstract _selectionCollector?: SelectionCollector<string, any>;
  private contextInternal?: SelectEntityContext;
  set context(value: SelectEntityContext | undefined) {
    this.cleanupContext();
    this.contextInternal = value;
    this.setupContext();
  }
  get context(): SelectEntityContext | undefined {
    return this.contextInternal;
  }

  ngAfterViewInit(): void {
    if (this.requireInitialSearch) {
      this.initialSearch();
    }
  }

  ngOnDestroy(): void {
    this.cleanupContext();
  }

  handleSelect(id: string): void {
    if (!this.contextInternal?.handleSelect) {
      return;
    }
    this.contextInternal.handleSelect(id);
  }

  private setupContext(): void {
    if (!this.contextInternal) {
      return;
    }
    this.multipleSelection = this.contextInternal.multipleSelection;
    this.contextInternal.getSelectedIds = () => (this._selectionCollector ? this._selectionCollector.selected : []);

    this.contextInternal.getLastServerSideRequest = () =>
      this._tableRef ? this._tableRef.getTableFilterRequest() : undefined;

    if (this._tableRef) {
      this.initialSearch();
    } else {
      this.requireInitialSearch = true;
    }
  }

  private cleanupContext(): void {
    this.multipleSelection = undefined;
    if (!this.contextInternal) {
      return;
    }
    this.contextInternal.getSelectedIds = undefined;
    this.contextInternal.getLastServerSideRequest = undefined;
  }

  private initialSearch(): void {
    const sourceId = this.contextInternal!.getSourceId!();
    if (!sourceId) {
      return;
    }
    this._tableRef!.onSearch('attributes.project', sourceId);
  }
}
