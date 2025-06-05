import { Pipe, PipeTransform } from '@angular/core';
import { TokenGroupCapacity } from '@exense/step-core';

@Pipe({
  name: 'calcStatusSummaryProgressbarPercent',
  standalone: false,
})
export class CalcStatusSummaryProgressbarPercentPipe implements PipeTransform {
  transform(tokenGroup: TokenGroupCapacity, status: string): number {
    let result = 0;
    if (tokenGroup.countByState![status]) {
      result = (tokenGroup.countByState![status] / tokenGroup.capacity!) * 100;
    }
    return result;
  }
}
