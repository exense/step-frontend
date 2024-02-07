import { NgModule } from '@angular/core';
import { AsyncOperationDialogComponent } from './components/async-operation-dialog/async-operation-dialog.component';
import { StepBasicsModule } from '../basics/step-basics.module';

@NgModule({
  declarations: [AsyncOperationDialogComponent],
  imports: [StepBasicsModule],
  exports: [AsyncOperationDialogComponent],
})
export class AsyncOperationsModule {}

export * from './components/async-operation-dialog/async-operation-dialog.component';
export * from './shared/async-operation-dialog-state.enum';
export * from './shared/async-operation-dialog-options';
export * from './shared/async-operation-close-status.enum';
export * from './shared/async-operation-dialog-result';
export * from './services/async-operation.service';
