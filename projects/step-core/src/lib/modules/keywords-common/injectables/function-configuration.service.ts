import { Keyword } from '../../../client/step-client-module';
import { Observable } from 'rxjs';
import { Injector } from '@angular/core';
export abstract class FunctionConfigurationService {
  abstract configure(injector: Injector, keyword?: Keyword, config?: any): Observable<Keyword | undefined>;
}
