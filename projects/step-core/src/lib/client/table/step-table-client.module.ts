import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [HttpClientModule],
  providers: [],
})
export class StepTableClientModule {}

export { TableApiWrapperService } from './services/table-api-wrapper.service';
export { TableRemoteDataSourceFactoryService } from './services/table-remote-data-source-factory.service';
export { FieldSort } from './shared/field-sort';
export { SortDirection } from './shared/sort-direction.enum';
export { TableRequestData, TableRequestFilter } from './shared/table-request-data';
export { TableResponseGeneric } from './shared/table-response-generic';
export { TableCollectionFilter } from './shared/table-collection-filter';
export { StepDataSource, StepDataSourceReloadOptions } from './shared/step-data-source';
