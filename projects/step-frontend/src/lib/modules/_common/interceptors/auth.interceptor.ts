import { inject, Injectable, Injector } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '@exense/step-core';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private _injector = inject(Injector);

  private handleAuthError(error: HttpErrorResponse): Observable<any> {
    if (error.status === 401) {
      /**
       * AuthService injects lots of dependencies from angularJS
       * Injecting it in the HttpInterceptor's constructor, prevent us to use HttpClient
       * in APP_INITIALIZER providers, which run before angularJS part's boot
       *
       * Retrieving AuthService through the Injector in concrete place, where it is used,
       * removes this restriction
       * **/
      const authService = this._injector.get(AuthService);
      // when checking for session auth error is expected
      if (authService.isAuthenticated() || authService.isOidc) {
        authService.goToLoginPage();
      }
    }
    return throwError(() => error);
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(catchError((error) => this.handleAuthError(error)));
  }
}
