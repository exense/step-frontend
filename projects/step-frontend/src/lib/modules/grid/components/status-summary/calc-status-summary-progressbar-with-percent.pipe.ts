import { Pipe, PipeTransform } from '@angular/core';
import { TokenGroupCapacity } from '@exense/step-core';

@Pipe({
  name: 'calcStatusSummaryProgressbarWithPercentPipe',
  standalone: false,
})
export class CalcStatusSummaryProgressbarWithPercentPipe implements PipeTransform {
  transform(tokenGroup: TokenGroupCapacity, status: string): number {
    return (tokenGroup.countByState![status] / tokenGroup.capacity!) * 100;
  }
}
