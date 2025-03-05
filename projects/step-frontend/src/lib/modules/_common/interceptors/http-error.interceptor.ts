import { inject, Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Observable, of, tap, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConnectionError } from '../shared/connection-error';
import { HttpErrorLoggerService } from '../injectables/http-error-logger.service';
import { NavigatorService } from '@exense/step-core';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  private _snackBar = inject(MatSnackBar);
  private _errorLogger = inject(HttpErrorLoggerService);
  private _navigator = inject(NavigatorService);

  private handleHttpError(error: HttpErrorResponse, skip401: boolean = false): Observable<any> {
    this._errorLogger.log('Network Error', error);

    if (error.status === 401 && skip401) {
      return throwError(() => error);
    }

    if (
      error.status === 403 &&
      error.error?.errorMessage === "You're not allowed to access this object from within this context"
    ) {
      this._navigator.navigateToHome({ forceClientUrl: true });
      return of(false);
    }

    let jsonError: any = error.error;

    // For some reason internal server errors are encoded as ArrayBuffer so we have to decode them first:
    if (error.error instanceof ArrayBuffer) {
      try {
        const decoder = new TextDecoder('utf-8'); // Ensure UTF-8 decoding
        const jsonString = decoder.decode(new Uint8Array(error.error));
        jsonError = JSON.parse(jsonString);
      } catch (e) {
        jsonError = { errorMessage: 'Failed to decode error response: ' + e };
      }
    }

    const parsedError = HttpErrorInterceptor.formatError(this.parseHttpError(jsonError || error.error || error));

    if (this.isConnectionError(parsedError)) {
      return throwError(() => new ConnectionError(error));
    }

    this.showError(parsedError);

    return throwError(() => error);
  }

  private parseHttpError(error: HttpErrorResponse): string {
    let jsonError: any = error.error || error;
    if (typeof jsonError === 'string' && error.headers.get('Content-Type')?.includes('application/json')) {
      try {
        jsonError = JSON.parse(jsonError);
      } catch (e) {
        console.log('Error parsing JSON response', e);
      }
    }

    if (jsonError?.errorMessage) {
      return jsonError.errorMessage;
    }
    if (error.name && error.message) {
      return `${error.name}: ${error.message}`;
    }
    if (jsonError) {
      return JSON.stringify(jsonError);
    }
    return 'Unknown HTTP error';
  }

  private handleAsyncError(response: HttpEvent<any>): HttpEvent<any> {
    if (response instanceof HttpResponse && response.body?.error) {
      this._errorLogger.log('Non HTTP Error', response.body?.error);
      const parsedError = HttpErrorInterceptor.formatError(response.body?.error);
      this.showError(parsedError);
    }
    return response;
  }

  static formatError(error: any): string {
    if (!error || typeof error !== 'object') {
      return String(error);
    }

    if (error.errorName && error.errorMessage) {
      return `${error.errorName}: ${error.errorMessage}`;
    }

    if (error.errorName || error.errorMessage) {
      return error.errorName ?? error.errorMessage;
    }

    if (error.error && error.text) {
      return `${error.error}: ${error.text}`;
    }

    if (error.error || error.text) {
      return error.error ?? error.text;
    }

    return JSON.stringify(error);
  }

  private showError(error: any) {
    if (typeof error !== 'string') {
      this._errorLogger.log('Error with unknown format', error);
    } else {
      this._snackBar.open(error, 'dismiss');
    }
  }

  private isConnectionError(error: any): boolean {
    return typeof error === 'string' && error.endsWith(': 0 Unknown Error');
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      tap((response: HttpEvent<any>) => {
        this.handleAsyncError(response);
      }),
      catchError((error) => this.handleHttpError(error, true)),
    );
  }
}
