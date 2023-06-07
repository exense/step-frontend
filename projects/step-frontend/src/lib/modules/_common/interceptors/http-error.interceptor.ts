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
    console.error('Network Error', error);
    if (error.status !== 401) {
      if (error.error?.errorMessage) {
        this.handleError(error.error);
      } else if (error.name && error.message) {
        this.handleError(`${error.name}: ${error.message}`);
      } else if (error.error) {
        this.handleError(error.error);
      } else {
        this.handleError('Unknown HTTP error');
      }
    }
    return throwError(() => error);
  }

  private handleAsyncError(response: HttpEvent<any>): HttpEvent<any> {
    if (response instanceof HttpResponse && response.body?.error) {
      console.error('Non HTTP Error', response.body?.error);
      this.handleError(response.body?.error);
    }
    return response;
  }

  private handleError(error: any) {
    if (error?.errorName && error?.errorMessage) {
      this.showError(`${error.errorName}: ${error.errorMessage}`);
    } else if (error?.errorName || error?.errorMessage) {
      this.showError(error.errorName || error.errorMessage);
    } else if (error?.error && error?.text) {
      this.showError(`${error.error}: ${error.text}`);
    } else if (error?.error || error?.text) {
      this.showError(error.error || error.text);
    } else {
      this.showError(error);
    }
  }

  private showError(error: any) {
    if (typeof error === 'string') {
      this._snackBar.open(error, 'dismiss');
    } else {
      console.error('Silent Error', error);
    }
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      tap((response: HttpEvent<any>) => {
        this.handleAsyncError(response);
      }),
      catchError((error) => this.handleHttpError(error))
    );
  }
}
