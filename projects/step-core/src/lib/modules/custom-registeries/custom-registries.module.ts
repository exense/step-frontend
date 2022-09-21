import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomItemRenderComponent } from './components/custom-item-render/custom-item-render.component';
import { EntityComponent } from './components/item-component/entity.component';
import { PlanTypeComponent } from './components/item-component/plan-type.component';
import { FunctionTypeComponent } from './components/item-component/function-type.component';
import { CustomCellComponent } from './components/item-component/custom-cell.component';
import { CustomSearchCellComponent } from './components/item-component/custom-search-cell.component';

@NgModule({
  declarations: [
    CustomItemRenderComponent,
    EntityComponent,
    PlanTypeComponent,
    FunctionTypeComponent,
    CustomCellComponent,
    CustomSearchCellComponent,
  ],
  imports: [CommonModule],
  exports: [EntityComponent, PlanTypeComponent, FunctionTypeComponent, CustomCellComponent, CustomSearchCellComponent],
})
export class CustomRegistriesModule {}

export * from './components/custom-item-render/custom-item-render.component';
export * from './components/item-component/entity.component';
export * from './components/item-component/function-type.component';
export * from './components/item-component/plan-type.component';
export * from './components/item-component/custom-cell.component';
export * from './components/item-component/custom-search-cell.component';
export * from './services/function-package-type-registry.service';
export * from './services/function-type-registry.service';
export * from './services/plan-type-registry.service';
export * from './services/custom-registry.service';
export * from './services/custom-cell-registry.service';
export * from './services/custom-search-cell-registry.service';
export * from './shared/custom-registry-item';
export * from './shared/custom-registry-type.enum';
export * from './shared/custom-component';
export * from './shared/entity-item';
