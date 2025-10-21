import { inject, NgModule } from '@angular/core';
import { StepCommonModule } from '../_common/step-common.module';
import { ArtefactService, DynamicSimpleValue, DynamicValuesUtilsService } from '@exense/step-core';
import { EchoComponent } from './component/echo/echo.component';
import { ThreadGroupComponent } from './component/thread-group/thread-group.component';
import { AssertComponent } from './component/assert/assert.component';
import { ExportComponent } from './component/export/export.component';
import { PlaceholderComponent } from './component/placeholder/placeholder.component';
import { EmptyInlineComponent } from './component/empty-inline/empty-inline.component';
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
import { EchoInlineComponent } from './component/echo-inline/echo-inline.component';
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
import { EmptyReportDetailsComponent } from './component/empty-report-details/empty-report-details.component';
import { SetReportDetailsComponent } from './component/set-report-details/set-report-details.component';
import { CheckReportDetailsComponent } from './component/check-report-details/check-report-details.component';
import { CallPlanReportDetailsComponent } from './component/call-plan-report-details/call-plan-report-details.component';
import { CaseReportDetailsComponent } from './component/case-report-details/case-report-details.component';
import { SynchronizedInlineComponent } from './component/synchronized-inline/synchronized-inline.component';
import { SynchronizedReportDetailsComponent } from './component/synchronized-report-details/synchronized-report-details.component';
import { ExportInlineComponent } from './component/export-inline/export-inline.component';
import { ExportReportDetailsComponent } from './component/export-report-details/export-report-details.component';
import { ScriptInlineComponent } from './component/script-inline/script-inline.component';
import { ScriptReportDetailsComponent } from './component/script-report-details/script-report-details.component';
import { ReturnInlineComponent } from './component/return-inline/return-inline.component';
import { ReturnReportDetailsComponent } from './component/return-report-details/return-report-details.component';
import { EchoReportDetailsComponent } from './component/echo-report-details/echo-report-details.component';
import { SequenceInlineComponent } from './component/sequence-inline/sequence-inline.component';
import { SequenceReportDetailsComponent } from './component/sequence-report-details/sequence-report-details.component';
import { SleepReportDetailsComponent } from './component/sleep-report-details/sleep-report-details.component';
import { SwitchInlineComponent } from './component/switch-inline/switch-inline.component';
import { SwitchReportDetailsComponent } from './component/switch-report-details/switch-report-details.component';
import { IfInlineComponent } from './component/if-inline/if-inline.component';
import { IfReportDetailsComponent } from './component/if-report-details/if-report-details.component';
import { TestSetInlineComponent } from './component/test-set-inline/test-set-inline.component';
import { TestSetReportDetailsComponent } from './component/test-set-report-details/test-set-report-details.component';
import { SessionInlineComponent } from './component/session-inline/session-inline.component';
import { SessionReportDetailsComponent } from './component/session-report-details/session-report-details.component';
import { AssertPerformanceReportDetailsComponent } from './component/assert-performance-report-details/assert-performance-report-details.component';
import { DataSetInlineComponent } from './component/data-set-inline/data-set-inline.component';
import { DataSetReportDetailsComponent } from './component/data-set-report-details/data-set-report-details.component';
import { ForEachInlineComponent } from './component/for-each-inline/for-each-inline.component';
import { ForEachReportDetailsComponent } from './component/for-each-report-details/for-each-report-details.component';
import { AssertReportDetailsComponent } from './component/assert-report-details/assert-report-details.component';
import { WhileInlineComponent } from './component/while-inline/while-inline.component';
import { WhileReportDetailsComponent } from './component/while-report-details/while-report-details.component';
import { ForReportDetailsComponent } from './component/for-report-details/for-report-details.component';
import { ThreadGroupInlineComponent } from './component/thread-group-inline/thread-group-inline.component';
import { ThreadGroupReportDetailsComponent } from './component/thread-group-report-details/thread-group-report-details.component';
import { RetryIfFailsInlineComponent } from './component/retry-if-fails-inline/retry-if-fails-inline.component';
import { RetryIfFailsReportDetailsComponent } from './component/retry-if-fails-report-details/retry-if-fails-report-details.component';
import { TestSetArtefact } from './types/test-set.artefact';
import { CallPlanArtefact } from './types/call-plan.artefact';
import { KeywordArtefact } from './types/keyword.artefact';
import { KeywordReportNode } from './types/keyword.report-node';
import { ForArtefact } from './types/for.artefact';
import { DataSourceFieldsService } from './injectables/data-source-fields.service';
import { ForEachArtefact } from './types/for-each.artefact';
import { EchoArtefact } from './types/echo.artefact';
import { EchoReportNode } from './types/echo.report-node';
import { SleepArtefact } from './types/sleep.artefact';
import { WhileArtefact } from './types/while.artefact';
import { DataSetArtefact } from './types/data-set.artefact';
import { Synchronized } from './types/synchronized.artefact';
import { SequenceArtefact } from './types/sequence.artefact';
import { ReturnArtefact } from './types/return.artefact';
import { IfArtefact } from './types/if.artefact';
import { SessionArtefact } from './types/session.artefact';
import { SetArtefact } from './types/set.artefact';
import { SetReportNode } from './types/set.report-node';
import { ScriptArtefact } from './types/script.artefact';
import { ThreadGroupArtefact } from './types/thread-group.artefact';
import { SwitchArtefact } from './types/switch.artefact';
import { CaseArtefact } from './types/case.artefact';
import { RetryIfFailsArtefact } from './types/retry-if-fails.artefact';
import { RetryIfFailsReportNode } from './types/retry-if-fails.report-node';
import { CheckArtefact } from './types/check.artefact';
import { AssertArtefact } from './types/assert.artefact';
import { AssertReportNode } from './types/assert.report-node';
import { ExportArtefact } from './types/export.artefact';
import { AssertPerformanceArtefact } from './types/assert-performance.artefact';

@NgModule({
  declarations: [
    EchoComponent,
    EchoInlineComponent,
    EchoReportDetailsComponent,
    ThreadGroupComponent,
    ThreadGroupInlineComponent,
    ThreadGroupReportDetailsComponent,
    AssertComponent,
    AssertInlineComponent,
    AssertReportDetailsComponent,
    PlaceholderComponent,
    EmptyInlineComponent,
    EmptyReportDetailsComponent,
    ExportComponent,
    ExportInlineComponent,
    ExportReportDetailsComponent,
    CheckComponent,
    CheckInlineComponent,
    CheckReportDetailsComponent,
    RetryIfFailsComponent,
    RetryIfFailsInlineComponent,
    RetryIfFailsReportDetailsComponent,
    CaseComponent,
    CaseInlineComponent,
    CaseReportDetailsComponent,
    SwitchComponent,
    SwitchInlineComponent,
    SwitchReportDetailsComponent,
    SleepComponent,
    SleepInlineComponent,
    SleepReportDetailsComponent,
    SetComponent,
    SetInlineComponent,
    SetReportDetailsComponent,
    IfComponent,
    IfInlineComponent,
    IfReportDetailsComponent,
    SequenceComponent,
    SequenceInlineComponent,
    SequenceReportDetailsComponent,
    SynchronizedComponent,
    SynchronizedInlineComponent,
    SynchronizedReportDetailsComponent,
    TestSetComponent,
    TestSetInlineComponent,
    TestSetReportDetailsComponent,
    ForComponent,
    ForInlineComponent,
    ForReportDetailsComponent,
    WhileComponent,
    WhileInlineComponent,
    WhileReportDetailsComponent,
    SessionComponent,
    SessionInlineComponent,
    SessionReportDetailsComponent,
    ReturnComponent,
    ReturnInlineComponent,
    ReturnReportDetailsComponent,
    DataSourceConfigurationComponent,
    DataSetComponent,
    DataSetInlineComponent,
    DataSetReportDetailsComponent,
    ForEachComponent,
    ForEachInlineComponent,
    ForEachReportDetailsComponent,
    CallPlanComponent,
    CallPlanInlineComponent,
    CallPlanReportDetailsComponent,
    CallKeywordComponent,
    CallKeywordInlineComponent,
    CallKeywordReportDetailsComponent,
    ScriptComponent,
    ScriptInlineComponent,
    ScriptReportDetailsComponent,
    AssertionPlanComponent,
    AssertPerformanceComponent,
    AssertPerformanceInlineComponent,
    AssertPerformanceReportDetailsComponent,
  ],
  imports: [StepCommonModule, ReportNodesModule],
  exports: [
    EchoComponent,
    EchoInlineComponent,
    EchoReportDetailsComponent,
    ThreadGroupComponent,
    ThreadGroupInlineComponent,
    ThreadGroupReportDetailsComponent,
    AssertComponent,
    AssertInlineComponent,
    AssertReportDetailsComponent,
    PlaceholderComponent,
    EmptyInlineComponent,
    EmptyReportDetailsComponent,
    ExportComponent,
    ExportInlineComponent,
    ExportReportDetailsComponent,
    CheckComponent,
    CheckInlineComponent,
    CheckReportDetailsComponent,
    RetryIfFailsComponent,
    RetryIfFailsInlineComponent,
    RetryIfFailsReportDetailsComponent,
    CaseComponent,
    CaseInlineComponent,
    CaseReportDetailsComponent,
    SwitchComponent,
    SwitchInlineComponent,
    SwitchReportDetailsComponent,
    SleepComponent,
    SleepInlineComponent,
    SleepReportDetailsComponent,
    SetComponent,
    SetInlineComponent,
    SetReportDetailsComponent,
    IfComponent,
    IfInlineComponent,
    IfReportDetailsComponent,
    SequenceComponent,
    SequenceInlineComponent,
    SequenceReportDetailsComponent,
    SynchronizedComponent,
    SynchronizedInlineComponent,
    SynchronizedReportDetailsComponent,
    TestSetComponent,
    TestSetInlineComponent,
    TestSetReportDetailsComponent,
    ForComponent,
    ForInlineComponent,
    ForReportDetailsComponent,
    WhileComponent,
    WhileInlineComponent,
    WhileReportDetailsComponent,
    SessionComponent,
    SessionInlineComponent,
    SessionReportDetailsComponent,
    ReturnComponent,
    ReturnInlineComponent,
    ReturnReportDetailsComponent,
    DataSourceConfigurationComponent,
    DataSetComponent,
    DataSetInlineComponent,
    DataSetReportDetailsComponent,
    ForEachComponent,
    ForEachInlineComponent,
    ForEachReportDetailsComponent,
    CallPlanComponent,
    CallPlanInlineComponent,
    CallPlanReportDetailsComponent,
    CallKeywordComponent,
    CallKeywordInlineComponent,
    CallKeywordReportDetailsComponent,
    ScriptComponent,
    ScriptInlineComponent,
    ScriptReportDetailsComponent,
    AssertionPlanComponent,
    AssertPerformanceComponent,
    AssertPerformanceInlineComponent,
    AssertPerformanceReportDetailsComponent,
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
      inlineComponent: TestSetInlineComponent,
      reportDetailsComponent: TestSetReportDetailsComponent,
      description: 'Used to group up TestCase’s as a single unit and executing them in parallel',
      getArtefactSearchValues: (artefact?: TestSetArtefact) => (artefact?.threads ? [artefact.threads] : undefined),
    });
    this._artefactService.register('TestCase', {
      icon: 'plan-testcase',
      inlineComponent: EmptyInlineComponent,
      reportDetailsComponent: EmptyReportDetailsComponent,
      description:
        'Specific container for a group of nodes, it will activate the top-level panel in the execution view for high-level test case execution monitoring',
    });
    this._artefactService.register('TestScenario', {
      icon: 'plan-testscenario',
      description: 'Usually used to parallelize the execution of multiple ThreadGroups or ‘sub’ plans',
      inlineComponent: EmptyInlineComponent,
      reportDetailsComponent: EmptyReportDetailsComponent,
    });
    this._artefactService.register('CallPlan', {
      icon: 'external-link',
      component: CallPlanComponent,
      inlineComponent: CallPlanInlineComponent,
      reportDetailsComponent: CallPlanReportDetailsComponent,
      description: 'Used to invoke a plan from within another plan',
      getArtefactSearchValues: (artefact?: CallPlanArtefact) =>
        [artefact?.selectionAttributes, artefact?.input].filter((item) => !!item),
    });
    this._artefactService.register('CallKeyword', {
      icon: 'keyword',
      component: CallKeywordComponent,
      inlineComponent: CallKeywordInlineComponent,
      reportDetailsComponent: CallKeywordReportDetailsComponent,
      description:
        'Technical node used as part of keyword invocation. Can be used explicitly in order to call a keyword by reflection',
      getArtefactSearchValues: (artefact?: KeywordArtefact) => (artefact?.argument ? [artefact.argument] : undefined),
      getReportNodeSearchValues: (reportNode?: KeywordReportNode): DynamicSimpleValue[] => {
        const _dynamicValueUtils = inject(DynamicValuesUtilsService);
        return [
          reportNode?.resolvedArtefact?.argument,
          reportNode?.input ? _dynamicValueUtils.convertSimpleValueToDynamicValue(reportNode.input) : undefined,
          reportNode?.output ? _dynamicValueUtils.convertSimpleValueToDynamicValue(reportNode.output) : undefined,
        ].filter((item) => !!item) as DynamicSimpleValue[];
      },
    });
    this._artefactService.register('For', {
      icon: 'cpu',
      component: ForComponent,
      inlineComponent: ForInlineComponent,
      reportDetailsComponent: ForReportDetailsComponent,
      description: 'Creates a For loop at execution time and iterates through its children',
      getArtefactSearchValues: (artefact?: ForArtefact) =>
        [
          artefact?.dataSource?.start,
          artefact?.dataSource?.end,
          artefact?.dataSource?.inc,
          artefact?.threads,
          artefact?.maxFailedLoops,
        ].filter((item) => !!item),
    });
    this._artefactService.register('ForEach', {
      icon: 'cpu',
      component: ForEachComponent,
      inlineComponent: ForEachInlineComponent,
      reportDetailsComponent: ForEachReportDetailsComponent,
      description: 'Creates a ForEach loop based on a collection and iterates through the child nodes',
      getArtefactSearchValues: (artefact?: ForEachArtefact) => {
        const _dataSourceFields = inject(DataSourceFieldsService);
        if (!artefact) {
          return undefined;
        }
        const { dataSource, dataSourceType, threads } = artefact;
        return [threads, ..._dataSourceFields.extractDataSourceSearchValues(dataSourceType!, dataSource!)].filter(
          (item) => !!item,
        );
      },
    });
    this._artefactService.register('While', {
      icon: 'rotate-cw',
      component: WhileComponent,
      inlineComponent: WhileInlineComponent,
      reportDetailsComponent: WhileReportDetailsComponent,
      description: 'Iterates over the node content until the given condition is not met',
      getArtefactSearchValues: (artefact?: WhileArtefact) => {
        if (!artefact) {
          return undefined;
        }
        return [artefact.condition, artefact.postCondition, artefact.pacing, artefact.timeout].filter((item) => !!item);
      },
    });
    this._artefactService.register('DataSet', {
      icon: 'grid',
      component: DataSetComponent,
      inlineComponent: DataSetInlineComponent,
      reportDetailsComponent: DataSetReportDetailsComponent,
      description: 'Used to iterate over rows of data in a table',
      getArtefactSearchValues: (artefact?: DataSetArtefact) => {
        const _dataSourceFields = inject(DataSourceFieldsService);
        if (!artefact) {
          return undefined;
        }
        const { dataSource, dataSourceType } = artefact;
        return [
          ..._dataSourceFields.extractDataSourceSearchValues(dataSourceType!, dataSource!),
          dataSource?.forWrite,
        ].filter((item) => !!item);
      },
    });
    this._artefactService.register('Synchronized', {
      icon: 'align-justify',
      component: SynchronizedComponent,
      inlineComponent: SynchronizedInlineComponent,
      reportDetailsComponent: SynchronizedReportDetailsComponent,
      description:
        'Guarantee thread safety within a test block by synchronizing all threads on the entire Test Execution',
      getArtefactSearchValues: (artefact?: Synchronized) => {
        if (!artefact) {
          return undefined;
        }
        return [artefact.lockName, artefact.globalLock].filter((item) => !!item);
      },
    });
    this._artefactService.register('Sequence', {
      icon: 'plan-sequence',
      component: SequenceComponent,
      inlineComponent: SequenceInlineComponent,
      reportDetailsComponent: SequenceReportDetailsComponent,
      description: 'Guarantees the ordering of the child nodes, as displayed in the tree.',
      getArtefactSearchValues: (artefact?: SequenceArtefact) => {
        if (!artefact) {
          return undefined;
        }
        return [artefact.continueOnError, artefact.pacing].filter((item) => !!item);
      },
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
      inlineComponent: ReturnInlineComponent,
      reportDetailsComponent: ReturnReportDetailsComponent,
      description: 'Used within a Composite Keyword, set the Composite output to the returned value(s)',
      getArtefactSearchValues: (artefact?: ReturnArtefact) => (artefact?.output ? [artefact.output] : undefined),
    });
    this._artefactService.register('Echo', {
      icon: 'zoom-in',
      component: EchoComponent,
      inlineComponent: EchoInlineComponent,
      reportDetailsComponent: EchoReportDetailsComponent,
      description: 'Used to print data in the report nodes of a plan, mostly for debugging or information purposes',
      getArtefactSearchValues: (artefact?: EchoArtefact) => (artefact?.text ? [artefact.text] : undefined),
      getReportNodeSearchValues: (reportNode?: EchoReportNode) => {
        const _dynamicValueUtils = inject(DynamicValuesUtilsService);
        if (reportNode?.echo) {
          return [_dynamicValueUtils.convertSimpleValueToDynamicValue(reportNode.echo) as DynamicSimpleValue];
        }
        return undefined;
      },
    });
    this._artefactService.register('If', {
      icon: 'square',
      component: IfComponent,
      inlineComponent: IfInlineComponent,
      reportDetailsComponent: IfReportDetailsComponent,
      description: 'Only executes the child nodes if the condition is met',
      getArtefactSearchValues: (artefact?: IfArtefact) => (artefact?.condition ? [artefact.condition] : undefined),
    });
    this._artefactService.register('Session', {
      icon: 'briefcase',
      component: SessionComponent,
      inlineComponent: SessionInlineComponent,
      reportDetailsComponent: SessionReportDetailsComponent,
      description: 'Guarantees that Keywords are executed within the the same Session i.e. Agent Token',
      getArtefactSearchValues: (artefact?: SessionArtefact) => (artefact?.token ? [artefact.token] : undefined),
    });
    this._artefactService.register('Set', {
      component: SetComponent,
      inlineComponent: SetInlineComponent,
      reportDetailsComponent: SetReportDetailsComponent,
      icon: 'download',
      description: 'Sets a value to a variable, which can then be accessed throughout Plans and sub Plans',
      getArtefactSearchValues: (artefact?: SetArtefact) => [artefact?.key, artefact?.value].filter((item) => !!item),
      getReportNodeSearchValues: (reportNode?: SetReportNode) => {
        const _dynamicValueUtils = inject(DynamicValuesUtilsService);
        return [reportNode?.key, reportNode?.value]
          .filter((item) => !!item)
          .map((item) => _dynamicValueUtils.convertSimpleValueToDynamicValue(item!) as DynamicSimpleValue);
      },
    });
    this._artefactService.register('Sleep', {
      icon: 'coffee',
      component: SleepComponent,
      inlineComponent: SleepInlineComponent,
      reportDetailsComponent: SleepReportDetailsComponent,
      description: 'Causes the thread to sleep',
      getArtefactSearchValues: (artefact?: SleepArtefact) => {
        return [artefact?.duration, artefact?.unit, artefact?.releaseTokens].filter((item) => !!item);
      },
    });
    this._artefactService.register('Script', {
      icon: 'align-left',
      component: ScriptComponent,
      inlineComponent: ScriptInlineComponent,
      reportDetailsComponent: ScriptReportDetailsComponent,
      description:
        'Executes any arbitrary groovy code. The script context is local, which means that variable used in the script control cannot be accessed externally by other nodes',
      getArtefactSearchValues: (artefact?: ScriptArtefact) => {
        const _dynamicValueUtils = inject(DynamicValuesUtilsService);
        if (!artefact?.script) {
          return undefined;
        }
        return [_dynamicValueUtils.convertSimpleValueToDynamicValue(artefact.script) as DynamicSimpleValue];
      },
    });
    this._artefactService.register('ThreadGroup', {
      icon: 'plan-threadgroup',
      component: ThreadGroupComponent,
      inlineComponent: ThreadGroupInlineComponent,
      reportDetailsComponent: ThreadGroupReportDetailsComponent,
      description: 'Starts multiple threads which will execute the node content in parallel',
      getArtefactSearchValues: (artefact?: ThreadGroupArtefact) =>
        [artefact?.users, artefact?.iterations, artefact?.maxDuration].filter((item) => !!item),
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
      inlineComponent: SwitchInlineComponent,
      reportDetailsComponent: SwitchReportDetailsComponent,
      description: 'Same as in any programming language, to use in combinaison with the "Case" control',
      getArtefactSearchValues: (artefact?: SwitchArtefact) =>
        artefact?.expression ? [artefact.expression] : undefined,
    });
    this._artefactService.register('Case', {
      icon: 'minus',
      component: CaseComponent,
      inlineComponent: CaseInlineComponent,
      reportDetailsComponent: CaseReportDetailsComponent,
      description: 'Same as in any programming language, to use in combinaison with the "Switch" control',
      getArtefactSearchValues: (artefact?: CaseArtefact) => (artefact?.value ? [artefact.value] : undefined),
    });
    this._artefactService.register('RetryIfFails', {
      icon: 'repeat',
      component: RetryIfFailsComponent,
      inlineComponent: RetryIfFailsInlineComponent,
      reportDetailsComponent: RetryIfFailsReportDetailsComponent,
      description: 'Retry mechanism with grace period',
      getArtefactSearchValues: (artefact?: RetryIfFailsArtefact) =>
        [artefact?.maxRetries, artefact?.gracePeriod, artefact?.timeout].filter((item) => !!item),
      getReportNodeSearchValues: (reportNode?: RetryIfFailsReportNode) => {
        const _dynamicValueUtils = inject(DynamicValuesUtilsService);
        return [
          reportNode?.tries
            ? (_dynamicValueUtils.convertSimpleValueToDynamicValue(reportNode.tries) as DynamicSimpleValue)
            : undefined,
          reportNode?.skipped
            ? (_dynamicValueUtils.convertSimpleValueToDynamicValue(reportNode.skipped) as DynamicSimpleValue)
            : undefined,
          reportNode?.resolvedArtefact?.maxRetries,
          reportNode?.resolvedArtefact?.gracePeriod,
          reportNode?.resolvedArtefact?.timeout,
        ].filter((item) => !!item);
      },
    });
    this._artefactService.register('Check', {
      icon: 'check',
      component: CheckComponent,
      inlineComponent: CheckInlineComponent,
      reportDetailsComponent: CheckReportDetailsComponent,
      description:
        'Performs a custom assertion using groovy expressions. Useful for validating the output of the parent node. For standard assertions use the Control Assert instead',
      getArtefactSearchValues: (artefact?: CheckArtefact) => (artefact?.expression ? [artefact.expression] : undefined),
    });
    this._artefactService.register('Assert', {
      icon: 'check',
      component: AssertComponent,
      inlineComponent: AssertInlineComponent,
      reportDetailsComponent: AssertReportDetailsComponent,
      description: 'Validates the output of a keyword execution.',
      getArtefactSearchValues: (artefact?: AssertArtefact) => {
        const _dynamicValueUtils = inject(DynamicValuesUtilsService);
        return [
          artefact?.doNegate,
          artefact?.actual,
          artefact?.expected,
          artefact?.operator
            ? (_dynamicValueUtils.convertSimpleValueToDynamicValue(artefact.operator) as DynamicSimpleValue)
            : undefined,
        ].filter((item) => !!item);
      },
      getReportNodeSearchValues: (reportNode?: AssertReportNode) => {
        const _dynamicValueUtils = inject(DynamicValuesUtilsService);
        return [reportNode?.message]
          .filter((item) => !!item)
          .map((item) => _dynamicValueUtils.convertSimpleValueToDynamicValue(item!) as DynamicSimpleValue);
      },
    });
    this._artefactService.register('Placeholder', {
      icon: 'square',
      component: PlaceholderComponent,
      inlineComponent: EmptyInlineComponent,
      reportDetailsComponent: EmptyReportDetailsComponent,
      description: '',
    });
    this._artefactService.register('Export', {
      icon: 'upload',
      component: ExportComponent,
      inlineComponent: ExportInlineComponent,
      reportDetailsComponent: ExportReportDetailsComponent,
      getArtefactSearchValues: (artefact?: ExportArtefact) =>
        [artefact?.value, artefact?.file, artefact?.prefix, artefact?.filter].filter((item) => !!item),
    });
    this._artefactService.register('Failure', {
      icon: 'x-octagon',
      inlineComponent: EmptyInlineComponent,
      isSelectable: false,
    });
    this._artefactService.register('PerformanceAssert', {
      icon: 'check',
      component: AssertPerformanceComponent,
      inlineComponent: AssertPerformanceInlineComponent,
      reportDetailsComponent: AssertPerformanceReportDetailsComponent,
      getArtefactSearchValues: (artefact?: AssertPerformanceArtefact) => {
        const _dynamicValueUtils = inject(DynamicValuesUtilsService);
        return [
          artefact?.aggregator
            ? (_dynamicValueUtils.convertSimpleValueToDynamicValue(artefact.aggregator) as DynamicSimpleValue)
            : undefined,
          artefact?.filters?.[0]?.filter,
          artefact?.comparator
            ? (_dynamicValueUtils.convertSimpleValueToDynamicValue(artefact.comparator) as DynamicSimpleValue)
            : undefined,
          artefact?.expectedValue,
        ].filter((item) => !!item);
      },
    });

    /* plan type control only */
    this._artefactService.register('AssertionPlan', {
      icon: 'check',
      component: AssertionPlanComponent,
      description: 'Can use AssertionMetrics to assert multiple executions when assigned to a Scheduler',
    });
  }
}
