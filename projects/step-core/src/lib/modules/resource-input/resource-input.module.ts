import { NgModule } from '@angular/core';
import { StepBasicsModule } from '../basics/step-basics.module';
import { FileAlreadyExistingDialogComponent } from './components/file-already-existing-dialog/file-already-existing-dialog.component';
import { SearchResourceDialogComponent } from './components/search-resource-dialog/search-resource-dialog.component';
import { UpdateResourceWarningDialogComponent } from './components/update-resource-warning-dialog/update-resource-warning-dialog.component';
import { ResourceInputComponent } from './components/resouce-input/resouce-input.component';
import { TableModule } from '../table/table.module';
import { StepIconsModule } from '../step-icons/step-icons.module';
import { StepMaterialModule } from '../step-material/step-material.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    FileAlreadyExistingDialogComponent,
    SearchResourceDialogComponent,
    UpdateResourceWarningDialogComponent,
    ResourceInputComponent,
  ],
  imports: [StepBasicsModule, TableModule, StepIconsModule, StepMaterialModule, CommonModule, FormsModule],
  exports: [
    FileAlreadyExistingDialogComponent,
    SearchResourceDialogComponent,
    UpdateResourceWarningDialogComponent,
    ResourceInputComponent,
  ],
})
export class ResourceInputModule {}

export * from './components/file-already-existing-dialog/file-already-existing-dialog.component';
export * from './components/search-resource-dialog/search-resource-dialog.component';
export * from './components/update-resource-warning-dialog/update-resource-warning-dialog.component';
export * from './components/resouce-input/resouce-input.component';
export * from './injectables/resource-dialogs.service';
export * from './injectables/resource-input-bridge.service';
export * from './injectables/resource-input.service';
