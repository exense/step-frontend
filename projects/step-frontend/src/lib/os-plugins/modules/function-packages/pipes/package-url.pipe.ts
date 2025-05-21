import { inject, Pipe, PipeTransform } from '@angular/core';
import { FunctionPackage } from '@exense/step-core';
import { Router } from '@angular/router';

@Pipe({
  name: 'packageUrl',
})
export class PackageUrlPipe implements PipeTransform {
  private _router = inject(Router);

  transform(idOrPackage?: string | FunctionPackage): string {
    if (!idOrPackage) {
      return '';
    }
    const id = typeof idOrPackage === 'string' ? idOrPackage : idOrPackage.id;

    return this.isKeywordsScreen ? `/functions/function-package-editor/${id}` : `/function-packages/editor/${id}`;
  }

  private get isKeywordsScreen(): boolean {
    return this._router.url.startsWith('/functions');
  }
}
