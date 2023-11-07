import { inject, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'safeHtml',
})
export class SafeHtmlPipe implements PipeTransform {
  private _domSanitizer = inject(DomSanitizer);

  transform(value: string | undefined): SafeHtml | undefined {
    if (!value) {
      return undefined;
    }
    return this._domSanitizer.bypassSecurityTrustHtml(value);
  }
}
