import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { UpgradeModule } from '@angular/upgrade/static';
import { TooltipDirective } from './directives/tooltip.directive';
import { CORE_INITIALIZER } from './core-initialiser';
import { StepMaterialModule } from './modules/step-material/step-material.module';
import { HasRightPipe } from './pipes/has-right.pipe';
import { TableModule } from './modules/table/table.module';
import {TextFilterPipePipe} from './pipes/filter.pipe';

@NgModule({
  declarations: [TooltipDirective, HasRightPipe, TextFilterPipePipe],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    UpgradeModule,
    StepMaterialModule,
    TableModule,
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    UpgradeModule,
    TooltipDirective,
    StepMaterialModule,
    HasRightPipe,
    TableModule,
    TextFilterPipePipe
  ],
  providers: [CORE_INITIALIZER],
})
export class StepCoreModule {}

export * from './domain';
export * from './shared';
export * from './decorators/plugin';
export * from './services/auth.service';
export * from './services/invoke-run.service';
export * from './services/view-registry.service';
export * from './services/deferred-view-registry.service';
export * from './services/async-task.service';
export * from './services/link-processor.service';
export * from './services/deferred-link-processor.service';
export * from './services/view-state.service';
export * from './services/context.service';
export { UibModalInstance, UibModalHelperService } from './services/uib-modal-helper.service';
export * from './angularjs';
export * from './directives/tooltip.directive';
export * from './pipes/has-right.pipe';
export * from './modules/step-material/step-material.module';
export * from './modules/table/table.module';
