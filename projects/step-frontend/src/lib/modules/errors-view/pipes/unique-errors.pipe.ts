import { Pipe, PipeTransform } from '@angular/core';
import { ErrorViewItem } from '../types/error-view-item';

@Pipe({
  standalone: true,
  name: 'uniqueErrors',
  pure: true,
})
export class UniqueErrorsPipe implements PipeTransform {
  transform(errors: ErrorViewItem[]): ErrorViewItem[] {
    const seen = new Set<string>();
    return errors.filter((error) => {
      if (seen.has(error.message)) {
        return false;
      }
      seen.add(error.message);
      return true;
    });
  }
}
