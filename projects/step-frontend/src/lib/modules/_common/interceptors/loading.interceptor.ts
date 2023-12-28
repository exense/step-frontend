import { HttpEvent, HttpEventType, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { GlobalProgressSpinnerService } from '@exense/step-core';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  private readonly endpoints: string[] = ['rest/plans'];
  private readonly routes: string[] = ['/plans/editor/'];

  private _globalProgressSpinnerService = inject(GlobalProgressSpinnerService);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      tap((event) => {
        if (!this.endpoints.includes(req.url)) {
          return;
        }

        if (!this.routes.some((route) => new RegExp(route).test(window.location.href))) {
          return;
        }

        switch (event.type) {
          case HttpEventType.Sent:
            this._globalProgressSpinnerService.showSpinner();
            break;

          case HttpEventType.Response:
            this._globalProgressSpinnerService.hideSpinner();
            break;
        }
      })
    );
  }
}
