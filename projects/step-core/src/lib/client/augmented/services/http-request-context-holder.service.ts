import { Injectable } from '@angular/core';
import { HttpContext } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class HttpRequestContextHolderService {
  private requestContext?: HttpContext;

  addContextToUpcomingRequest(context: HttpContext): void {
    this.requestContext = context;
  }

  decorateRequestOptions<T extends (Record<string, any> & { context?: HttpContext }) | undefined = undefined>(
    options?: T,
  ): T {
    const context = this.requestContext;
    this.requestContext = undefined;

    if (context) {
      options = !options ? ({ context } as T) : { ...options, context };
    }

    return options!;
  }
}
