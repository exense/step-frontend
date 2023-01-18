import { Pipe, PipeTransform } from '@angular/core';
import { Measure, ReportNode } from '@exense/step-core';

@Pipe({
  name: 'callFunctionReportNodeExternalLink',
})
export class CallFunctionReportNodeExternalLinkPipe implements PipeTransform {
  transform(measure: Measure, node: ReportNode): string {
    return `/#/root/dashboards-rtm/__pp__RTMDashboard?__filter1__=text,eId,${node.executionID},Off&__filter2__=text,name,${measure.name},Off`;
  }
}
