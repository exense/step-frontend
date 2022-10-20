import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkTreeModule } from '@angular/cdk/tree';
import { TreeComponent } from './components/tree/tree.component';
import { StepBasicsModule } from '../basics/step-basics.module';
import { StepIconsModule } from '../step-icons/step-icons.module';
import { StepMaterialModule } from '../step-material/step-material.module';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { IsNodeSelectedPipe } from './pipes/is-node-selected.pipe';
import { TreeDragPreviewComponent } from './components/tree-drag-preview/tree-drag-preview.component';
import { IsRootNodePipe } from './pipes/is-root-node.pipe';

@NgModule({
  declarations: [TreeComponent, IsNodeSelectedPipe, TreeDragPreviewComponent, IsRootNodePipe],
  imports: [CommonModule, StepBasicsModule, StepIconsModule, StepMaterialModule, CdkTreeModule, DragDropModule],
  exports: [TreeComponent],
})
export class TreeModule {}

export * from './components/tree/tree.component';
export * from './services/tree-state.service';
export * from './shared/abstract-artefact-with-parent-id';
export * from './shared/artefact-flat-node';
export * from './shared/tree-action';
