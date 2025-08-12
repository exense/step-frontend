import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'statusIcon',
  standalone: false,
})
export class StatusIconPipe implements PipeTransform {
  transform(status: string | null | undefined): string {
    switch (status) {
      case 'PASSED':
      case 'ENDED':
        return 'check-square';
      case 'FAILED':
      case 'TECHNICAL_ERROR':
      case 'IMPORT_ERROR':
        return 'x-square';
      case 'ABORTING':
      case 'INITIALIZING':
      case 'IMPORTING':
      case 'EXPORTING':
      case 'RUNNING':
      case 'ESTIMATING':
      case 'PROVISIONING':
      case 'DEPROVISIONING':
        return 'refresh-cw';
      default:
        return 'square';
    }
  }
}
