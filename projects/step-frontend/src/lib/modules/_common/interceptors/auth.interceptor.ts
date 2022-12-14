import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '@exense/step-core';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private _authService: AuthService) {}

  private handleAuthError(error: HttpErrorResponse): Observable<any> {
    if (error.status === 401) {
      // when checking for session auth error is expected
      if (this._authService.isAuthenticated() || this._authService.isOidc) {
        this._authService.goToLoginPage();
      }
    }
    return throwError(() => error);
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(catchError((error) => this.handleAuthError(error)));
  }
}
