import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { OVERRIDE_INTERCEPTOR_ID } from '@exense/step-core';

@Injectable()
export class HttpErrorOverrideInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const errorOverride = req.context?.get(OVERRIDE_INTERCEPTOR_ID);
    if (!errorOverride) {
      return next.handle(req);
    }

    return next.handle(req).pipe(errorOverride);
  }
}
