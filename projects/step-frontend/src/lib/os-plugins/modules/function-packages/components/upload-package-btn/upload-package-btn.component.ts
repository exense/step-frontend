import { Component, inject } from '@angular/core';
import { CustomComponent, StepDataSource } from '@exense/step-core';
import { FunctionPackageActionsService } from '../../injectables/function-package-actions.service';

@Component({
  selector: 'step-upload-package-btn',
  templateUrl: './upload-package-btn.component.html',
  styleUrls: ['./upload-package-btn.component.scss'],
})
export class UploadPackageBtnComponent implements CustomComponent {
  private _actions = inject(FunctionPackageActionsService);

  context?: StepDataSource<any>;

  addFunctionPackage(): void {
    this._actions.openAddFunctionPackageDialog().subscribe((result) => {
      if (result) {
        this.context?.reload();
      }
    });
  }
}
