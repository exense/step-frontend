import { AfterViewInit, Component, inject, QueryList, ViewChildren } from '@angular/core';
import { MatColumnDef } from '@angular/material/table';
import { SearchColDirective } from '../../modules/table/table.module';
import { CustomComponent } from '../../modules/custom-registeries/custom-registries.module';
import { ColumnContainer } from '../../shared';

export type EntityColumnContext = string | { entityName: string; entityPath: string };

@Component({
  selector: 'step-entity-column',
  templateUrl: './entity-column.component.html',
  styleUrls: ['./entity-column.component.scss'],
})
export class EntityColumnComponent implements CustomComponent, AfterViewInit {
  private _entityColumnContainer = inject(ColumnContainer);

  context!: EntityColumnContext;

  @ViewChildren(MatColumnDef) colDef?: QueryList<MatColumnDef>;
  @ViewChildren(SearchColDirective) searchColDef?: QueryList<SearchColDirective>;

  entityName?: string;
  entityPath?: string;

  ngAfterViewInit(): void {
    this._entityColumnContainer.initColumns(this.colDef, this.searchColDef);
  }
  contextChange(previousContext?: EntityColumnContext, currentContext?: EntityColumnContext) {
    if (currentContext === previousContext) {
      return;
    }
    if (!currentContext) {
      this.entityName = undefined;
      this.entityPath = undefined;
      return;
    }
    if (typeof currentContext === 'string') {
      this.entityName = currentContext;
      this.entityPath = undefined;
      return;
    }
    this.entityName = currentContext.entityName;
    this.entityPath = currentContext.entityPath;
  }
}
