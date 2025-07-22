import { Pipe, PipeTransform } from '@angular/core';
import { Measure, ReportNode } from '@exense/step-core';

@Pipe({
  name: 'callFunctionReportNodeExternalLink',
  standalone: false,
})
export class CallFunctionReportNodeExternalLinkPipe implements PipeTransform {
  transform(measure: Measure, node: ReportNode): string {
    return `/#/analytics?eId=${node.executionID}&name=${measure.name}&tsParams=eId,name`;
  }
}
