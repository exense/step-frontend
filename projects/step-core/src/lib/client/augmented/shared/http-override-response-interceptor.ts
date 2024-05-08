import { OperatorFunction } from 'rxjs';
import { HttpEvent } from '@angular/common/http';

export abstract class HttpOverrideResponseInterceptor {
  abstract overrideInterceptor(override: OperatorFunction<HttpEvent<any>, HttpEvent<any>>): this;
}
