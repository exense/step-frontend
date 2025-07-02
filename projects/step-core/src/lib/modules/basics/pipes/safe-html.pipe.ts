import { inject, Pipe, PipeTransform, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'safeHtml',
  standalone: false,
})
export class SafeHtmlPipe implements PipeTransform {
  private _domSanitizer = inject(DomSanitizer);

  transform(value: string | undefined): SafeHtml | undefined {
    if (!value) {
      return undefined;
    }
    const html = this._domSanitizer.sanitize(SecurityContext.HTML, value);
    if (!html) {
      return undefined;
    }
    return this._domSanitizer.bypassSecurityTrustHtml(html);
  }
}
