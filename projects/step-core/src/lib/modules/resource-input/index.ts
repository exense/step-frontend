import { ResourceInputComponent } from './components/resource-input/resource-input.component';
import { FileAlreadyExistingDialogComponent } from './components/file-already-existing-dialog/file-already-existing-dialog.component';
import { SearchResourceDialogComponent } from './components/search-resource-dialog/search-resource-dialog.component';
import { UpdateResourceWarningDialogComponent } from './components/update-resource-warning-dialog/update-resource-warning-dialog.component';

export const RESOURCE_INPUT_IMPORTS = [
  FileAlreadyExistingDialogComponent,
  ResourceInputComponent,
  SearchResourceDialogComponent,
  UpdateResourceWarningDialogComponent,
];

export * from './components/file-already-existing-dialog/file-already-existing-dialog.component';
export * from './components/search-resource-dialog/search-resource-dialog.component';
export * from './components/update-resource-warning-dialog/update-resource-warning-dialog.component';
export * from './components/resource-input/resource-input.component';
export * from './injectables/resource-dialogs.service';
export * from './injectables/resource-input-bridge.service';
export * from './injectables/resource-input.service';
export * from './injectables/resource-input-utils.service';
export * from './types/resource-input-custom-action';
