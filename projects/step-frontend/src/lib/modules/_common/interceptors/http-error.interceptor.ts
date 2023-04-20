import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Observable, tap, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  constructor(private _snackBar: MatSnackBar) {}

  private handleHttpError(error: HttpErrorResponse): Observable<any> {
    console.error('network error', error);
    if (error.status !== 401) {
      if (error.error) {
        this.showError(error.error);
      } else if (error.name && error.message) {
        this.showError(error.name + ': ' + error.message);
      } else {
        this.showError('Unknown HTTP error');
      }
    }
    return throwError(() => error);
  }

  private handleAsyncError(response: HttpEvent<any>): HttpEvent<any> {
    if (response instanceof HttpResponse && response.body?.error) {
      console.error(`Non HTTP Error: ${response.body.error}`);
      this.showError(response.body?.error);
    }
    return response;
  }

  private showError(error: any) {
    if (error?.errorName && error?.errorMessage) {
      this._snackBar.open(error.errorName + ': ' + error.errorMessage, 'dismiss');
    } else if (error?.errorName || error?.errorMessage) {
      this._snackBar.open(error.errorName || error.errorMessage, 'dismiss');
    } else {
      this._snackBar.open(error, 'dismiss');
    }
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      tap((response: HttpEvent<any>) => {
        return this.handleAsyncError(response);
      }),
      catchError((error) => this.handleHttpError(error))
    );
  }
}
