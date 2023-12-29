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
import { catchError } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  constructor(private _snackBar: MatSnackBar) {}

  private handleHttpError(error: HttpErrorResponse, skip401: boolean = false): Observable<any> {
    console.error('Network Error', error);
    if (error.status === 401 && skip401) {
      return throwError(() => error);
    }

    let parsedError;
    if (error.error?.errorMessage) {
      parsedError = HttpErrorInterceptor.formatError(error.error);
    } else if (error.name && error.message) {
      parsedError = HttpErrorInterceptor.formatError(`${error.name}: ${error.message}`);
    } else if (error.error) {
      parsedError = HttpErrorInterceptor.formatError(error.error);
    } else {
      parsedError = HttpErrorInterceptor.formatError('Unknown HTTP error');
    }
    this.showError(parsedError);

    return throwError(() => error);
  }

  private handleAsyncError(response: HttpEvent<any>): HttpEvent<any> {
    if (response instanceof HttpResponse && response.body?.error) {
      console.error('Non HTTP Error', response.body?.error);
      const parsedError = HttpErrorInterceptor.formatError(response.body?.error);
      this.showError(parsedError);
    }
    return response;
  }

  static formatError(error: any) {
    let parsedError;
    if (error?.errorName && error?.errorMessage) {
      parsedError = `${error.errorName}: ${error.errorMessage}`;
    } else if (error?.errorName || error?.errorMessage) {
      parsedError = error.errorName || error.errorMessage;
    } else if (error?.error && error?.text) {
      parsedError = `${error.error}: ${error.text}`;
    } else if (error?.error || error?.text) {
      parsedError = error.error || error.text;
    } else {
      parsedError = error;
    }

    return parsedError;
  }

  private showError(error: any) {
    if (typeof error !== 'string') {
      console.error('Error with unknown format', error);
    } else if (error.endsWith(': 0 Unknown Error')) {
      /* ": 0 Unknown Error" indicates a general network error, for now we assume this is always the case and format it in a user-friendly way */
      this._snackBar.open('An unknown Network Error occurred', 'dismiss');
    } else {
      this._snackBar.open(error, 'dismiss');
    }
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      tap((response: HttpEvent<any>) => {
        this.handleAsyncError(response);
      }),
      catchError((error) => this.handleHttpError(error, true))
    );
  }
}
