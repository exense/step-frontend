import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  constructor(private _snackBar: MatSnackBar) {}

  private handleHttpError(error: HttpErrorResponse): Observable<any> {
    if (error.status !== 401) {
      if (typeof error.error === 'object') {
        this._snackBar.open(error.error.errorName + ': error.error.errorMessage', 'dismiss');
      } else {
        this._snackBar.open(error.error, 'dismiss');
      }
    }
    return throwError(() => error);
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(catchError((error) => this.handleHttpError(error)));
  }
}
