import { AfterViewInit, Component, inject, QueryList, ViewChildren } from '@angular/core';
import { MatColumnDef } from '@angular/material/table';
import { SearchColDirective } from '../../modules/table/table.module';
import { CustomComponent } from '../../modules/custom-registeries/custom-registries.module';
import { EntityColumnContainer } from '../../shared';

@Component({
  selector: 'step-entity-column',
  templateUrl: './entity-column.component.html',
  styleUrls: ['./entity-column.component.scss'],
})
export class EntityColumnComponent implements CustomComponent, AfterViewInit {
  private entityColumnContainer = inject(EntityColumnContainer);

  context!: string;

  @ViewChildren(MatColumnDef) colDef?: QueryList<MatColumnDef>;
  @ViewChildren(SearchColDirective) searchColDef?: QueryList<SearchColDirective>;

  ngAfterViewInit(): void {
    this.entityColumnContainer.initColumns(this.colDef, this.searchColDef);
  }
}
