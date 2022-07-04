import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [HttpClientModule],
  providers: [],
})
export class StepTableClientModule {}

export { TableRestService } from './services/table-rest.service';
