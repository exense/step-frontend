import { catchError, of, OperatorFunction, pipe } from 'rxjs';
import { HttpErrorResponse, HttpEvent, HttpResponse, HttpStatusCode } from '@angular/common/http';
import { ENTITY_ACCESS_DENIED_CODE, FORBIDDEN_ACCESS_FROM_CURRENT_CONTEXT } from './errors.constants';

export type ForbiddenResponse = { forbidden: string };

export const httpOverrideForbiddenResponse = (): OperatorFunction<HttpEvent<any>, HttpEvent<any>> =>
  pipe(
    catchError((error: HttpErrorResponse) => {
      if (
        error.status === HttpStatusCode.Forbidden &&
        (error.error?.errorMessage === FORBIDDEN_ACCESS_FROM_CURRENT_CONTEXT ||
          error.error?.errorName === ENTITY_ACCESS_DENIED_CODE)
      ) {
        const response = new HttpResponse({
          status: HttpStatusCode.Ok,
          body: {
            forbidden: error.error.errorMessage,
          } as ForbiddenResponse,
        });
        return of(response);
      }
      throw error;
    }),
  );
