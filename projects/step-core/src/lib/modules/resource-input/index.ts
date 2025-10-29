import { ResourceInputComponent } from './components/resource-input/resource-input.component';
import { SearchResourceDialogComponent } from './components/search-resource-dialog/search-resource-dialog.component';
import { UpdateResourceWarningDialogComponent } from './components/update-resource-warning-dialog/update-resource-warning-dialog.component';
import { ResourceInfoComponent } from './components/resource-info/resource-info.component';

export const RESOURCE_INPUT_IMPORTS = [
  ResourceInputComponent,
  SearchResourceDialogComponent,
  UpdateResourceWarningDialogComponent,
  ResourceInfoComponent,
];

export * from './components/search-resource-dialog/search-resource-dialog.component';
export * from './components/update-resource-warning-dialog/update-resource-warning-dialog.component';
export * from './components/resource-input/resource-input.component';
export * from './components/resource-input/resource-input-config.directive';
export * from './components/resource-info/resource-info.component';
export * from './injectables/resource-dialogs.service';
export * from './injectables/resource-input-bridge.service';
export * from './injectables/resource-input.service';
export * from './injectables/resource-input-utils.service';
