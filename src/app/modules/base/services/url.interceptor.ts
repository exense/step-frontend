import { Inject, Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../shared/api-url.token';

@Injectable()
export class UrlInterceptor implements HttpInterceptor {

  constructor(
    @Inject(API_URL) private _apiUrl: string
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const urlRequest = request.clone({
      url: `${this._apiUrl}${request.url}` 
    })
    return next.handle(urlRequest);
  }
}
