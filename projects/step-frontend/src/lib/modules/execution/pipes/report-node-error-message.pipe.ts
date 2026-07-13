import { Pipe, PipeTransform } from '@angular/core';
import { ReportNode } from '@exense/step-core';

@Pipe({
  name: 'reportNodeErrorMessage',
  standalone: false,
})
export class ReportNodeErrorMessagePipe implements PipeTransform {
  transform(item: ReportNode | null | undefined): string | undefined {
    return item?.error?.msg?.trim() || undefined;
  }
}
