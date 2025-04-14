import { AutomationPackageListComponent } from './components/automation-package-list/automation-package-list.component';
import { AutomationPackageUploadDialogComponent } from './components/automation-package-upload-dialog/automation-package-upload-dialog.component';
import { AutomationPackageExecutionDialogComponent } from './components/automation-package-execution-dialog/automation-package-execution-dialog.component';

export * from './automation-package.initializer';

export const AUTOMATION_PACKAGE_IMPORTS = [
  AutomationPackageExecutionDialogComponent,
  AutomationPackageListComponent,
  AutomationPackageUploadDialogComponent,
];
