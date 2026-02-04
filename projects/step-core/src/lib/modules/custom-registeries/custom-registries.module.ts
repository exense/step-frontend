import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomItemRenderComponent } from './components/custom-item-render/custom-item-render.component';
import { EntityComponent } from './components/item-component/entity.component';
import { PlanTypeComponent } from './components/item-component/plan-type.component';
import { FunctionTypeComponent } from './components/item-component/function-type.component';
import { CustomCellComponent } from './components/item-component/custom-cell.component';
import { CustomSearchCellComponent } from './components/item-component/custom-search-cell.component';
import { DashletComponent } from './components/item-component/dashlet.component';
import { ExecutionCustomPanelComponent } from './components/item-component/execution-custom-panel.component';

@NgModule({
  declarations: [
    CustomItemRenderComponent,
    EntityComponent,
    PlanTypeComponent,
    FunctionTypeComponent,
    CustomCellComponent,
    CustomSearchCellComponent,
    DashletComponent,
    ExecutionCustomPanelComponent,
  ],
  imports: [CommonModule],
  exports: [
    EntityComponent,
    PlanTypeComponent,
    FunctionTypeComponent,
    CustomCellComponent,
    CustomSearchCellComponent,
    DashletComponent,
    ExecutionCustomPanelComponent,
    CustomItemRenderComponent,
  ],
})
export class CustomRegistriesModule {}

export * from './components/custom-item-render/custom-item-render.component';
export * from './components/item-component/entity.component';
export * from './components/item-component/function-type.component';
export * from './components/item-component/plan-type.component';
export * from './components/item-component/custom-cell.component';
export * from './components/item-component/custom-search-cell.component';
export * from './components/item-component/dashlet.component';
export * from './components/item-component/execution-custom-panel.component';
export * from './services/function-package-type-registry.service';
export * from './services/function-type-registry.service';
export * from './services/plan-type-registry.service';
export * from './services/custom-registry.service';
export * from './services/custom-cell-registry.service';
export * from './services/custom-search-cell-registry.service';
export * from './services/dashlet-registry.service';
export * from './services/wizard-registry.service';
export * from './services/execution-custom-panel-registry.service';
export * from './services/entity-menu-items-registry.service';
export * from './services/automation-package-entity-table-registry.service';
export * from './services/grid-settings-registry.service';
export { ItemInfo } from './services/base-registry.service';
export * from './shared/custom-registry-item';
export * from './shared/custom-registry-type.enum';
export * from './shared/custom-component';
export * from './shared/entity-item';
