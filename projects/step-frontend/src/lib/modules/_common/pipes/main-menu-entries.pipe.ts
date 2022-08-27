import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'mainMenuEntriesJson',
})
export class MainMenuEntriesPipe implements PipeTransform {
  transform(value: unknown): boolean {
    return value == null || value == '{}';
  }
}
