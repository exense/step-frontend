import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { StepBasicsModule } from '../basics/step-basics.module';
import { StepIconsModule } from '../step-icons/step-icons.module';
import { StepMaterialModule } from '../step-material/step-material.module';
import { TreeDragPreviewComponent } from './components/tree-drag-preview/tree-drag-preview.component';
import { TreeNodeNameComponent } from './components/tree-node-name/tree-node-name.component';
import { TreeNodeComponent } from './components/tree-node/tree-node.component';
import { TreeComponent } from './components/tree/tree.component';
import { TreeNodeActionsPipe } from './pipes/tree-node-actions.pipe';
import { TreeNodeTemplateDirective } from './directives/tree-node-template.directive';
import {
  DragDropContainerComponent,
  DragItemDirective,
  DropAreaDirective,
  IsDragDataPipe,
  DragPreviewDirective,
} from '../drag-drop';

@NgModule({
  declarations: [
    TreeComponent,
    TreeDragPreviewComponent,
    TreeNodeActionsPipe,
    TreeNodeNameComponent,
    TreeNodeComponent,
    TreeNodeTemplateDirective,
  ],
  imports: [
    CommonModule,
    StepBasicsModule,
    StepIconsModule,
    StepMaterialModule,
    ReactiveFormsModule,
    DragDropContainerComponent,
    DragItemDirective,
    DropAreaDirective,
    DragPreviewDirective,
    IsDragDataPipe,
  ],
  exports: [TreeComponent, TreeNodeTemplateDirective],
})
export class TreeModule {}

export * from './components/tree/tree.component';
export * from './directives/tree-node-template.directive';
export * from './services/tree-actions.service';
export * from './services/tree-node-utils.service';
export * from './services/tree-state.service';
export * from './shared/tree-action';
export * from './shared/tree-flat-node';
export * from './shared/tree-node';
export * from './shared/artefact-tree-node';
export * from './shared/tree-state-init-options.interface';
