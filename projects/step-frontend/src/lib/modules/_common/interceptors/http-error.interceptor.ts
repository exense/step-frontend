import { inject, Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
  HttpStatusCode,
} from '@angular/common/http';
import { Observable, tap, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ConnectionError } from '../shared/connection-error';
import { HttpErrorLoggerService } from '../injectables/http-error-logger.service';
import {
  ErrorMessageHandlerService,
  NoAccessEntityError,
  FORBIDDEN_ACCESS_FROM_CURRENT_CONTEXT,
  ENTITY_ACCESS_DENIED_CODE,
} from '@exense/step-core';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  private _errorMessageHandler = inject(ErrorMessageHandlerService);
  private _errorLogger = inject(HttpErrorLoggerService);

  private handleHttpError(error: HttpErrorResponse, skip401: boolean = false, isGetRequest: boolean): Observable<any> {
    this._errorLogger.log('Network Error', error);

    if (error.status === HttpStatusCode.Unauthorized && skip401) {
      return throwError(() => error);
    }

    if (
      error.status === HttpStatusCode.Forbidden &&
      (error.error?.errorMessage === FORBIDDEN_ACCESS_FROM_CURRENT_CONTEXT ||
        error.error?.errorName === ENTITY_ACCESS_DENIED_CODE)
    ) {
      if (!isGetRequest) {
        const { parsedError, logMessages } = this.parseHttpError(error);
        const formattedError = HttpErrorInterceptor.formatError(parsedError);
        if (!!logMessages?.length) {
          logMessages.forEach((errorMessage) => console.error(errorMessage));
        }
        this.showError(formattedError);
      }
      return throwError(() => new NoAccessEntityError(error));
    }

    const { parsedError, logMessages } = this.parseHttpError(error);
    const formattedError = HttpErrorInterceptor.formatError(parsedError);

    if (this.isConnectionError(formattedError, error)) {
      return throwError(() => new ConnectionError(error));
    }

    if (!!logMessages?.length) {
      logMessages.forEach((errorMessage) => console.error(errorMessage));
    }

    this.showError(formattedError);

    return throwError(() => error);
  }

  private parseHttpError(error: HttpErrorResponse): { parsedError: string; logMessages?: string[] } {
    const errorContentType = error.headers.get('Content-Type');
    const isJson = errorContentType?.includes?.('application/json') ?? false;

    let jsonError: any;

    // For some reason internal server errors are encoded as ArrayBuffer so we have to decode them first:
    if (error.error instanceof ArrayBuffer) {
      try {
        const decoder = new TextDecoder('utf-8'); // Ensure UTF-8 decoding
        const errorString = decoder.decode(new Uint8Array(error.error));
        if (isJson) {
          jsonError = JSON.parse(errorString);
        } else {
          jsonError = { errorMessage: errorString };
        }
      } catch (e) {
        jsonError = { errorMessage: 'Failed to decode error response: ' + e };
      }
    } else if (isJson && typeof error.error === 'string') {
      jsonError = JSON.parse(error.error);
    } else if (isJson) {
      jsonError = error.error;
    } else {
      jsonError = { errorMessage: error.error };
    }

    const logMessages: string[] | undefined = [];

    if (jsonError?.errorMessage || jsonError?.errorName) {
      if (jsonError.errorMessage && typeof jsonError.errorMessage !== 'string') {
        logMessages.push([`Unexpected error type. isJson=${isJson}`, jsonError.errorMessage].join(', '));
        try {
          logMessages.push(JSON.stringify(jsonError.errorMessage));
        } catch (e) {}
      }
      return {
        parsedError: `${jsonError.errorName ?? 'Error'}: ${jsonError.errorMessage}`,
        logMessages,
      };
    }

    if (error instanceof HttpErrorResponse && error.name && error.message) {
      return { parsedError: `${error.name}: ${error.message}` };
    }

    if (jsonError) {
      return { parsedError: JSON.stringify(jsonError) };
    }

    return { parsedError: 'Unknown HTTP error' };
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
    if (!error || (typeof error !== 'object' && !error.includes('{'))) {
      /* make sure the error is no object or object parsed to string */
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

    if ((error.error || error.text) && !error?.error?.isTrusted) {
      return error.error ?? error.text;
    }

    return '';
  }

  private showError(error: any) {
    if (typeof error !== 'string' || error === '') {
      this._errorLogger.log('Error with unknown format', error);
    } else {
      this._errorMessageHandler.showError(error);
    }
  }

  private isConnectionError(parsedError: string, error: HttpErrorResponse): boolean {
    if (error.status === HttpStatusCode.BadGateway || error.status === HttpStatusCode.GatewayTimeout) {
      return true;
    }

    return (
      (typeof parsedError === 'string' && parsedError.endsWith(': 0 Unknown Error')) ||
      error.error instanceof ProgressEvent
    );
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      tap((response: HttpEvent<any>) => {
        this.handleAsyncError(response);
      }),
      catchError((error) => this.handleHttpError(error, true, req.method === 'GET')),
    );
  }
}
