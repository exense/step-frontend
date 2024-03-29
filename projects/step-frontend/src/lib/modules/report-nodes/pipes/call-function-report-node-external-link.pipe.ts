import { Pipe, PipeTransform } from '@angular/core';
import { Measure, ReportNode } from '@exense/step-core';

@Pipe({
  name: 'callFunctionReportNodeExternalLink',
})
export class CallFunctionReportNodeExternalLinkPipe implements PipeTransform {
  transform(measure: Measure, node: ReportNode): string {
    // return `/#/dashboards-rtm/__pp__RTMDashboard?__filter1__=text,eId,${node.executionID},Off&__filter2__=text,name,${measure.name},Off`;
    return `/#/analytics?eId=${node.executionID}&name=${measure.name}&tsParams=eId,name`;
  }
}
