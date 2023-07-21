import { Observable } from 'rxjs';

export abstract class FunctionLinkDialogService {
  abstract openFunctionEditor(id: string, dialogRef?: any): Observable<any>;
  abstract getFunctionEditorPath(id: string, dialogConfig?: any): Observable<string>;
}
