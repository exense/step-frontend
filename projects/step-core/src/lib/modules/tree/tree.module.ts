import { DragDropModule } from '@angular/cdk/drag-drop';
import { CdkTreeModule } from '@angular/cdk/tree';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { StepBasicsModule } from '../basics/step-basics.module';
import { StepIconsModule } from '../step-icons/step-icons.module';
import { StepMaterialModule } from '../step-material/step-material.module';
import { TreeDragPlaceholderComponent } from './components/tree-drag-placeholder/tree-drag-placeholder.component';
import { TreeDragPreviewComponent } from './components/tree-drag-preview/tree-drag-preview.component';
import { TreeNodeNameComponent } from './components/tree-node-name/tree-node-name.component';
import { TreeNodeComponent } from './components/tree-node/tree-node.component';
import { TreeComponent } from './components/tree/tree.component';
import { ArrayOfSizePipe } from './pipes/array-of-size.pipe';
import { IsNodeSelectedPipe } from './pipes/is-node-selected.pipe';
import { IsRootNodePipe } from './pipes/is-root-node.pipe';
import { TreeNodeActionsPipe } from './pipes/tree-node-actions.pipe';
import { IsNodeSelectedForInsertPipe } from './pipes/is-node-selected-for-insert.pipe';
import { NodeElementRefDirective } from './directives/node-element-ref.directive';

@NgModule({
  declarations: [
    TreeComponent,
    IsNodeSelectedPipe,
    TreeDragPreviewComponent,
    IsRootNodePipe,
    TreeNodeActionsPipe,
    TreeNodeNameComponent,
    TreeDragPlaceholderComponent,
    TreeNodeComponent,
    ArrayOfSizePipe,
    IsNodeSelectedForInsertPipe,
    NodeElementRefDirective,
  ],
  imports: [
    CommonModule,
    StepBasicsModule,
    StepIconsModule,
    StepMaterialModule,
    CdkTreeModule,
    DragDropModule,
    ReactiveFormsModule,
  ],
  exports: [TreeComponent],
})
export class TreeModule {}

export * from './components/tree/tree.component';
export * from './services/tree-actions.service';
export * from './services/tree-node-utils.service';
export * from './services/tree-state.service';
export * from './shared/abstract-artefact-with-parent-id';
export * from './shared/artefact-flat-node';
export * from './shared/tree-action';
export * from './shared/tree-flat-node';
export * from './shared/tree-node';
export * from './shared/artefact-tree-node';
export * from './shared/tree-state-init-options.interface';
