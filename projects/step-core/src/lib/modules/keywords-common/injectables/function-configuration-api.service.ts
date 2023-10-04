import { Observable } from 'rxjs';
import { Keyword } from '../../../client/step-client-module';

export abstract class FunctionConfigurationApiService {
  abstract newFunctionTypeConf(type: string): Observable<Keyword>;
  abstract saveFunction(keyword?: Keyword): Observable<Keyword>;
  abstract getFunctionEditor(id: string): Observable<string>;
}
