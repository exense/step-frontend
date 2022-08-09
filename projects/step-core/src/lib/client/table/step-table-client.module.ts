import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [HttpClientModule],
  providers: [],
})
export class StepTableClientModule {}

export { TableRestService } from './services/table-rest.service';
export { FieldFilter } from './models/field-filter';
export { FieldSort } from './models/field-sort';
export { OQLFilter } from './models/oql-filter';
export { FullTextFilter } from './models/full-text-filter';
export { SortDirection } from './models/sort-direction.enum';
export { TableParameters } from './models/table-parameters';
export { TableRequestData } from './models/table-request-data';
export { TableResponse } from './models/table-response';
