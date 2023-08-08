import { Observable } from 'rxjs';
import { Function as Keyword } from '../../client/step-client-module';

export abstract class FunctionLinkDialogService {
  abstract openFunctionEditor(keyword: Keyword, dialogRef?: any): Observable<any>;
  abstract getFunctionEditorPath(id: string, dialogConfig?: any): Observable<string>;
}
