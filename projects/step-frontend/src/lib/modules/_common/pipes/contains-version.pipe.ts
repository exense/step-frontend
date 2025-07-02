import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'containsVersion',
  standalone: false,
})
export class ContainsVersionPipe implements PipeTransform {
  transform(value: string): boolean {
    // The build server will replace versionPlaceholders starting with ${, so if they are not replaced they don't contain a valid version
    return value !== '' && !value.includes('${');
  }
}
