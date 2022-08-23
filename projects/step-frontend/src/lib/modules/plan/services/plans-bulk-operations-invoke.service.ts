import { Injectable } from '@angular/core';
import {
  BulkOperationParameters,
  BulkOperationsInvokeService,
  DialogsService,
  ExportsService,
  ExportStatus,
  PlansService,
} from '@exense/step-core';
import { Observable } from 'rxjs';

@Injectable()
export class PlansBulkOperationsInvokeService extends BulkOperationsInvokeService<string> {
  constructor(_exportsService: ExportsService, _dialogs: DialogsService, protected _plans: PlansService) {
    super(_exportsService, _dialogs);
  }

  protected override invokeDelete(requestBody?: BulkOperationParameters): Observable<ExportStatus> {
    return this._plans.deletePlans(requestBody);
  }
  protected override invokeDuplicate(requestBody?: BulkOperationParameters): Observable<ExportStatus> {
    return this._plans.clonePlans(requestBody);
  }

  protected override invokeExport = undefined;
}
