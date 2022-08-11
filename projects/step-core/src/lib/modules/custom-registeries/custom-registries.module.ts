import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomItemRenderComponent } from './components/custom-item-render/custom-item-render.component';
import { EntityComponent } from './components/item-component/entity.component';
import { EntityIconNewComponent } from './components/item-component/entity-icon.component';
import { PlanTypeComponent } from './components/item-component/plan-type.component';
import { FunctionTypeComponent } from './components/item-component/function-type.component';

@NgModule({
  declarations: [
    CustomItemRenderComponent,
    EntityComponent,
    EntityIconNewComponent,
    PlanTypeComponent,
    FunctionTypeComponent,
  ],
  imports: [CommonModule],
  exports: [EntityComponent, EntityIconNewComponent, PlanTypeComponent, FunctionTypeComponent],
})
export class CustomRegistriesModule {}

export * from './components/custom-item-render/custom-item-render.component';
export * from './components/item-component/entity.component';
export * from './components/item-component/entity-icon.component';
export * from './components/item-component/function-type.component';
export * from './components/item-component/plan-type.component';
export * from './services/entity-registry.service';
export * from './services/function-package-type-registry.service';
export * from './services/function-type-registry.service';
export * from './services/plan-type-registry.service';
export * from './services/custom-registry.service';
export * from './shared/custom-registry-item';
export * from './shared/custom-registry-type.enum';
export * from './shared/entity-item';
