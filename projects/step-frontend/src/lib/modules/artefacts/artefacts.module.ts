import { NgModule } from '@angular/core';
import { StepCommonModule } from '../_common/step-common.module';
import { ArtefactService } from '@exense/step-core';
import { EchoComponent } from './component/echo/echo.component';
import { ThreadGroupComponent } from './component/thread-group/thread-group.component';
import { AssertComponent } from './component/assert/assert.component';
import { ExportComponent } from './component/export/export.component';
import { PlaceholderComponent } from './component/placeholder/placeholder.component';
import { CheckComponent } from './component/check/check.component';
import { RetryIfFailsComponent } from './component/retry-if-fails/retry-if-fails.component';
import { CaseComponent } from './component/case/case.component';
import { SwitchComponent } from './component/switch/switch.component';
import { SleepComponent } from './component/sleep/sleep.component';
import { SetComponent } from './component/set/set.component';
import { IfComponent } from './component/if/if.component';
import { SequenceComponent } from './component/sequence/sequence.component';
import { SynchronizedComponent } from './component/synchronized/synchronized.component';
import { TestSetComponent } from './component/test-set/test-set.component';
import { ForComponent } from './component/for/for.component';
import { WhileComponent } from './component/while/while.component';
import { SessionComponent } from './component/session/session.component';
import { ReturnComponent } from './component/return/return.component';
import { DataSourceConfigurationComponent } from './component/data-source-configuration/data-source-configuration.component';
import { DataSetComponent } from './component/data-set/data-set.component';
import { ForEachComponent } from './component/for-each/for-each.component';
import { CallPlanComponent } from './component/call-plan/call-plan.component';
import { CallKeywordComponent } from './component/call-keyword/call-keyword.component';
import { ScriptComponent } from './component/script/script.component';
import { AssertionPlanComponent } from './component/assertion-plan/assertion-plan.component';
import { AssertPerformanceComponent } from './component/assert-performance/assert-performance.component';
import { ArtefactInlineFieldComponent } from './component/artefact-inline-field/artefact-inline-field.component';
import { EchoInlineComponent } from './component/echo-inline/echo-inline.component';
import { ArtefactInlineFieldListComponent } from './component/artefact-inline-field-list/artefact-inline-field-list.component';
import { CallKeywordInlineComponent } from './component/call-keyword-inline/call-keyword-inline.component';
import { SetInlineComponent } from './component/set-inline/set-inline.component';
import { ForInlineComponent } from './component/for-inline/for-inline.component';
import { SleepInlineComponent } from './component/sleep-inline/sleep-inline.component';
import { AssertInlineComponent } from './component/assert-inline/assert-inline.component';
import { AssertPerformanceInlineComponent } from './component/assert-performance-inline/assert-performance-inline.component';
import { CallPlanInlineComponent } from './component/call-plan-inline/call-plan-inline.component';
import { CaseInlineComponent } from './component/case-inline/case-inline.component';
import { CheckInlineComponent } from './component/check-inline/check-inline.component';
import { CallKeywordReportDetailsComponent } from './component/call-keyword-report-details/call-keyword-report-details.component';
import { ReportNodesModule } from '../report-nodes/report-nodes.module';

@NgModule({
  declarations: [
    EchoComponent,
    EchoInlineComponent,
    ThreadGroupComponent,
    AssertComponent,
    AssertInlineComponent,
    PlaceholderComponent,
    ExportComponent,
    CheckComponent,
    CheckInlineComponent,
    RetryIfFailsComponent,
    CaseComponent,
    CaseInlineComponent,
    SwitchComponent,
    SleepComponent,
    SleepInlineComponent,
    SetComponent,
    SetInlineComponent,
    IfComponent,
    SequenceComponent,
    SynchronizedComponent,
    TestSetComponent,
    ForComponent,
    ForInlineComponent,
    WhileComponent,
    SessionComponent,
    ReturnComponent,
    DataSourceConfigurationComponent,
    DataSetComponent,
    ForEachComponent,
    CallPlanComponent,
    CallPlanInlineComponent,
    CallKeywordComponent,
    CallKeywordInlineComponent,
    CallKeywordReportDetailsComponent,
    ScriptComponent,
    AssertionPlanComponent,
    AssertPerformanceComponent,
    AssertPerformanceInlineComponent,
    ArtefactInlineFieldComponent,
    ArtefactInlineFieldListComponent,
  ],
  imports: [StepCommonModule, ReportNodesModule],
  exports: [
    EchoComponent,
    EchoInlineComponent,
    ThreadGroupComponent,
    AssertComponent,
    AssertInlineComponent,
    PlaceholderComponent,
    ExportComponent,
    CheckComponent,
    CheckInlineComponent,
    RetryIfFailsComponent,
    CaseComponent,
    CaseInlineComponent,
    SwitchComponent,
    SleepComponent,
    SetComponent,
    SetInlineComponent,
    IfComponent,
    SequenceComponent,
    SynchronizedComponent,
    TestSetComponent,
    ForComponent,
    ForInlineComponent,
    WhileComponent,
    SessionComponent,
    ReturnComponent,
    DataSourceConfigurationComponent,
    DataSetComponent,
    ForEachComponent,
    CallPlanComponent,
    CallPlanInlineComponent,
    CallKeywordComponent,
    CallKeywordInlineComponent,
    CallKeywordReportDetailsComponent,
    ScriptComponent,
    AssertionPlanComponent,
    AssertPerformanceComponent,
    AssertPerformanceInlineComponent,
    ArtefactInlineFieldComponent,
    ArtefactInlineFieldListComponent,
  ],
})
export class ArtefactsModule {
  constructor(private _artefactService: ArtefactService) {
    this.registerArtefacts();
  }

  registerArtefacts(): void {
    this._artefactService.register('TestSet', {
      icon: 'plan-testset',
      component: TestSetComponent,
      description: 'Used to group up TestCase’s as a single unit and executing them in parallel',
    });
    this._artefactService.register('TestCase', {
      icon: 'plan-testcase',
      description:
        'Specific container for a group of nodes, it will activate the top-level panel in the execution view for high-level test case execution monitoring',
    });
    this._artefactService.register('TestScenario', {
      icon: 'plan-testscenario',
      description: 'Usually used to parallelize the execution of multiple ThreadGroups or ‘sub’ plans',
    });
    this._artefactService.register('CallPlan', {
      icon: 'external-link',
      component: CallPlanComponent,
      inlineComponent: CallPlanInlineComponent,
      description: 'Used to invoke a plan from within another plan',
    });
    this._artefactService.register('CallKeyword', {
      icon: 'keyword',
      component: CallKeywordComponent,
      inlineComponent: CallKeywordInlineComponent,
      reportDetailsComponent: CallKeywordReportDetailsComponent,
      description:
        'Technical node used as part of keyword invocation. Can be used explicitly in order to call a keyword by reflection',
    });
    this._artefactService.register('For', {
      icon: 'cpu',
      component: ForComponent,
      inlineComponent: ForInlineComponent,
      description: 'Creates a For loop at execution time and iterates through its children',
    });
    this._artefactService.register('ForEach', {
      icon: 'cpu',
      component: ForEachComponent,
      description: 'Creates a ForEach loop based on a collection and iterates through the child nodes',
    });
    this._artefactService.register('While', {
      icon: 'rotate-cw',
      component: WhileComponent,
      description: 'Iterates over the node content until the given condition is not met',
    });
    this._artefactService.register('DataSet', {
      icon: 'grid',
      component: DataSetComponent,
      description: 'Used to iterate over rows of data in a table',
    });
    this._artefactService.register('Synchronized', {
      icon: 'align-justify',
      component: SynchronizedComponent,
      description:
        'Guarantee thread safety within a test block by synchronizing all threads on the entire Test Execution',
    });
    this._artefactService.register('Sequence', {
      icon: 'plan-sequence',
      component: SequenceComponent,
      description: 'Guarantees the ordering of the child nodes, as displayed in the tree.',
    });
    this._artefactService.register('BeforeSequence', {
      icon: 'arrow-up',
      component: SequenceComponent,
    });
    this._artefactService.register('AfterSequence', {
      icon: 'arrow-down',
      component: SequenceComponent,
    });
    this._artefactService.register('Return', {
      icon: 'corner-up-right',
      component: ReturnComponent,
      description: 'Used within a Composite Keyword, set the Composite output to the returned value(s)',
    });
    this._artefactService.register('Echo', {
      icon: 'zoom-in',
      component: EchoComponent,
      inlineComponent: EchoInlineComponent,
      description: 'Used to print data in the report nodes of a plan, mostly for debugging or information purposes',
    });
    this._artefactService.register('If', {
      icon: 'square',
      component: IfComponent,
      description: 'Only executes the child nodes if the condition is met',
    });
    this._artefactService.register('Session', {
      icon: 'briefcase',
      component: SessionComponent,
      description: 'Guarantees that Keywords are executed within the the same Session i.e. Agent Token',
    });
    this._artefactService.register('Set', {
      component: SetComponent,
      inlineComponent: SetInlineComponent,
      icon: 'download',
      description: 'Sets a value to a variable, which can then be accessed throughout Plans and sub Plans',
    });
    this._artefactService.register('Sleep', {
      icon: 'coffee',
      component: SleepComponent,
      inlineComponent: SleepInlineComponent,
      description: 'Causes the thread to sleep',
    });
    this._artefactService.register('Script', {
      icon: 'align-left',
      component: ScriptComponent,
      description:
        'Executes any arbitrary groovy code. The script context is local, which means that variable used in the script control cannot be accessed externally by other nodes',
    });
    this._artefactService.register('ThreadGroup', {
      icon: 'plan-threadgroup',
      component: ThreadGroupComponent,
      description: 'Starts multiple threads which will execute the node content in parallel',
    });
    this._artefactService.register('BeforeThread', {
      icon: 'chevron-left',
      component: SequenceComponent,
    });
    this._artefactService.register('AfterThread', {
      icon: 'chevron-right',
      component: SequenceComponent,
    });
    this._artefactService.register('Thread', {
      icon: 'code',
      component: ThreadGroupComponent,
      isSelectable: false,
    });
    this._artefactService.register('Switch', {
      icon: 'more-vertical',
      component: SwitchComponent,
      description: 'Same as in any programming language, to use in combinaison with the "Case" control',
    });
    this._artefactService.register('Case', {
      icon: 'minus',
      component: CaseComponent,
      inlineComponent: CaseInlineComponent,
      description: 'Same as in any programming language, to use in combinaison with the "Switch" control',
    });
    this._artefactService.register('RetryIfFails', {
      icon: 'repeat',
      component: RetryIfFailsComponent,
      description: 'Retry mechanism with grace period',
    });
    this._artefactService.register('Check', {
      icon: 'check',
      component: CheckComponent,
      inlineComponent: CheckInlineComponent,
      description:
        'Performs a custom assertion using groovy expressions. Useful for validating the output of the parent node. For standard assertions use the Control Assert instead',
    });
    this._artefactService.register('Assert', {
      icon: 'check',
      component: AssertComponent,
      inlineComponent: AssertInlineComponent,
      description: 'Validates the output of a keyword execution.',
    });
    this._artefactService.register('Placeholder', {
      icon: 'square',
      component: PlaceholderComponent,
      description: '',
    });
    this._artefactService.register('Export', {
      icon: 'upload',
      component: ExportComponent,
    });
    this._artefactService.register('Failure', {
      icon: 'x-octagon',
      isSelectable: false,
    });
    this._artefactService.register('PerformanceAssert', {
      icon: 'check',
      component: AssertPerformanceComponent,
      inlineComponent: AssertPerformanceInlineComponent,
    });

    /* plan type control only */
    this._artefactService.register('AssertionPlan', {
      icon: 'check',
      component: AssertionPlanComponent,
      description: 'Can use AssertionMetrics to assert multiple executions when assigned to a Scheduler',
    });
  }
}
