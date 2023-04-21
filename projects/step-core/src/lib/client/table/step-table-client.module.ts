import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [HttpClientModule],
  providers: [],
})
export class StepTableClientModule {}

export { TableApiWrapperService } from './services/table-api-wrapper.service';
export { FieldSort } from './models/field-sort';
export { SortDirection } from './models/sort-direction.enum';
export { TableRequestData, TableRequestFilter } from './models/table-request-data';
export { TableResponseGeneric } from './models/table-response-generic';
export { TableCollectionFilter } from './models/table-collection-filter';
