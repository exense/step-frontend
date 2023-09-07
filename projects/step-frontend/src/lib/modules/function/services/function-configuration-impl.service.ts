import { inject, Injectable, Injector } from '@angular/core';
import {
  FunctionConfigurationService,
  Function as Keyword,
  FunctionDialogsConfig,
  FunctionConfigurationDialogData,
} from '@exense/step-core';
import { Observable } from 'rxjs';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { FunctionConfigurationDialogComponent } from '../components/function-configuration-dialog/function-configuration-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class FunctionConfigurationImplService implements FunctionConfigurationService {
  private _matDialog = inject(MatDialog);

  configure(injector: Injector, keyword?: Keyword, config?: FunctionDialogsConfig): Observable<Keyword | undefined> {
    const matDialogConfig: MatDialogConfig<FunctionConfigurationDialogData> = {
      data: {
        keyword,
        dialogConfig: config!,
      },
      injector,
    };
    const dialogRef = this._matDialog.open(FunctionConfigurationDialogComponent, matDialogConfig);

    return dialogRef.afterClosed();
  }
}
