import { Pipe, PipeTransform } from '@angular/core';
import { FunctionPackage } from '@exense/step-core';

@Pipe({
  name: 'packageUrl',
})
export class PackageUrlPipe implements PipeTransform {
  transform(idOrPackage?: string | FunctionPackage): string {
    if (!idOrPackage) {
      return '';
    }
    const id = typeof idOrPackage === 'string' ? idOrPackage : idOrPackage.id;
    return `/functionPackages/editor/${id}`;
  }
}
