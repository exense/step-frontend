import { AfterViewInit, Component, OnDestroy, Signal } from '@angular/core';
import { TableComponent } from '../../../table/table.module';
import { CustomComponent } from '../../../custom-registeries/custom-registries.module';
import { SelectEntityContext } from '../../types/select-entity-context.interface';
import { EntityObject } from '../../types/entity-object';

@Component({
  template: '',
  standalone: false,
})
export abstract class BaseEntitySelectionTableComponent implements AfterViewInit, CustomComponent, OnDestroy {
  private requireInitialSearch = false;

  protected multipleSelection?: boolean;
  protected abstract tableRef: Signal<TableComponent<any> | undefined>;
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

  handleSelect(item: EntityObject): void {
    if (!this.contextInternal?.handleSelect) {
      return;
    }
    this.contextInternal.handleSelect(item);
  }

  private setupContext(): void {
    if (!this.contextInternal) {
      return;
    }
    this.multipleSelection = this.contextInternal.multipleSelection;

    if (!!this.tableRef()) {
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
  }

  private initialSearch(): void {
    const sourceId = this.contextInternal!.getSourceId!();
    if (!sourceId) {
      return;
    }
    this.tableRef()!.onSearch('attributes.project', sourceId);
  }
}
