import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AsyncOperationDialogComponent } from './components/async-operation-dialog/async-operation-dialog.component';
import { StepMaterialModule } from '../step-material/step-material.module';

@NgModule({
  declarations: [AsyncOperationDialogComponent],
  imports: [StepMaterialModule, CommonModule],
  exports: [AsyncOperationDialogComponent],
})
export class AsyncOperationsModule {}

export * from './components/async-operation-dialog/async-operation-dialog.component';
export * from './shared/async-operation-dialog-state.enum';
export * from './shared/async-operation-dialog-options';
export * from './services/async-operation.service';
