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

@NgModule({
  declarations: [
    EchoComponent,
    ThreadGroupComponent,
    AssertComponent,
    PlaceholderComponent,
    ExportComponent,
    CheckComponent,
    RetryIfFailsComponent,
    CaseComponent,
    SwitchComponent,
    SleepComponent,
    SetComponent,
    IfComponent,
    SequenceComponent,
    SynchronizedComponent,
    TestSetComponent,
    ForComponent,
    WhileComponent,
    SessionComponent,
    ReturnComponent,
    DataSourceConfigurationComponent,
    DataSetComponent,
  ],
  imports: [StepCommonModule],
  exports: [
    EchoComponent,
    ThreadGroupComponent,
    AssertComponent,
    PlaceholderComponent,
    ExportComponent,
    CheckComponent,
    RetryIfFailsComponent,
    CaseComponent,
    SwitchComponent,
    SleepComponent,
    SetComponent,
    IfComponent,
    SequenceComponent,
    SynchronizedComponent,
    TestSetComponent,
    ForComponent,
    WhileComponent,
    SessionComponent,
    ReturnComponent,
    DataSourceConfigurationComponent,
    DataSetComponent,
  ],
})
export class ArtefactsModule {
  constructor(private _artefactService: ArtefactService) {
    this.registerArtefacts();
  }

  registerArtefacts(): void {
    this._artefactService.register('TestSet', {
      icon: 'glyphicon-folder-close',
      iconNg2: 'folder',
      component: TestSetComponent,
      description: 'Used to group up TestCase’s as a single unit and executing them in parallel',
    });
    this._artefactService.register('TestCase', {
      icon: 'glyphicon-list-alt',
      iconNg2: 'list',
      description:
        'Specific container for a group of nodes, it will activate the top-level panel in the execution view for high-level test case execution monitoring',
    });
    this._artefactService.register('TestScenario', {
      icon: 'glyphicon-equalizer',
      iconNg2: 'bar-chart-2',
      description: 'Usually used to parallelize the execution of multiple ThreadGroups or ‘sub’ plans',
    });
    this._artefactService.register('CallPlan', {
      icon: 'glyphicon-new-window',
      iconNg2: 'external-link',
      form: 'partials/artefacts/callPlan.html',
      description: 'Used to invoke a plan from within another plan',
    });
    this._artefactService.register('CallKeyword', {
      icon: 'glyphicon-record',
      iconNg2: 'target',
      form: 'partials/artefacts/callFunction.html',
      description:
        'Technical node used as part of keyword invocation. Can be used explicitly in order to call a keyword by reflection',
    });
    this._artefactService.register('For', {
      icon: 'glyphicon-th',
      iconNg2: 'cpu',
      component: ForComponent,
      description: 'Creates a For loop at execution time and iterates through its children',
    });
    this._artefactService.register('ForEach', {
      icon: 'glyphicon-th',
      iconNg2: 'cpu',
      form: 'partials/artefacts/forEach.html',
      description: 'Creates a ForEach loop based on a collection and iterates through the child nodes',
    });
    this._artefactService.register('While', {
      icon: 'glyphicon-repeat',
      iconNg2: 'rotate-cw',
      component: WhileComponent,
      description: 'Iterates over the node content until the given condition is not met',
    });
    this._artefactService.register('DataSet', {
      icon: 'glyphicon-th-large',
      iconNg2: 'grid',
      component: DataSetComponent,
      description: 'Used to iterate over rows of data in a table',
    });
    this._artefactService.register('Synchronized', {
      icon: 'glyphicon-align-justify',
      iconNg2: 'align-justify',
      component: SynchronizedComponent,
      description:
        'Guarantee thread safety within a test block by synchronizing all threads on the entire Test Execution',
    });
    this._artefactService.register('Sequence', {
      icon: 'glyphicon-align-justify',
      iconNg2: 'align-justify',
      component: SequenceComponent,
      description: 'Guarantees the ordering of the child nodes, as displayed in the tree.',
    });
    this._artefactService.register('BeforeSequence', {
      icon: 'glyphicon-arrow-up',
      iconNg2: 'arrow-up',
      component: SequenceComponent,
      description: '',
    });
    this._artefactService.register('AfterSequence', {
      icon: 'glyphicon-arrow-down',
      iconNg2: 'arrow-down',
      component: SequenceComponent,
      description: '',
    });
    this._artefactService.register('Return', {
      icon: 'glyphicon-share-alt',
      iconNg2: 'corner-up-right',
      component: ReturnComponent,
      description: 'Used within a Composite Keyword, set the Composite output to the returned value(s)',
    });
    this._artefactService.register('Echo', {
      icon: 'glyphicon-zoom-in',
      iconNg2: 'zoom-in',
      component: EchoComponent,
      description: 'Used to print data in the report nodes of a plan, mostly for debugging or information purposes',
    });
    this._artefactService.register('If', {
      icon: 'glyphicon-unchecked',
      iconNg2: 'square',
      component: IfComponent,
      description: 'Only executes the child nodes if the condition is met',
    });
    this._artefactService.register('Session', {
      icon: 'glyphicon-magnet',
      iconNg2: 'briefcase',
      component: SessionComponent,
      description: 'Guarantees that Keywords are executed within the the same Session i.e. Agent Token',
    });
    this._artefactService.register('Set', {
      icon: 'glyphicon-save',
      component: SetComponent,
      iconNg2: 'download',
      description: 'Sets a value to a variable, which can then be accessed throughout Plans and sub Plans',
    });
    this._artefactService.register('Sleep', {
      icon: 'glyphicon-hourglass',
      iconNg2: 'coffee',
      component: SleepComponent,
      description: 'Causes the thread to sleep',
    });
    this._artefactService.register('Script', {
      icon: 'glyphicon-align-left',
      iconNg2: 'align-left',
      form: 'partials/artefacts/script.html',
      description:
        'Executes any arbitrary groovy code. The script context is local, which means that variable used in the script control cannot be accessed externally by other nodes',
    });
    this._artefactService.register('ThreadGroup', {
      icon: 'glyphicon-resize-horizontal',
      iconNg2: 'code',
      component: ThreadGroupComponent,
      description: 'Starts multiple threads which will execute the node content in parallel',
    });
    this._artefactService.register('BeforeThread', {
      icon: 'glyphicon-arrow-left',
      iconNg2: 'chevron-left',
      component: SequenceComponent,
      description: '',
    });
    this._artefactService.register('AfterThread', {
      icon: 'glyphicon-arrow-right',
      iconNg2: 'chevron-right',
      component: SequenceComponent,
      description: '',
    });
    this._artefactService.register('Thread', {
      icon: 'glyphicon-resize-horizontal',
      iconNg2: 'code',
      component: ThreadGroupComponent,
      description: '',
      isSelectable: false,
    });
    this._artefactService.register('Switch', {
      icon: 'glyphicon-option-vertical',
      iconNg2: 'more-vertical',
      component: SwitchComponent,
      description: 'Same as in any programming language, to use in combinaison with the "Case" control',
    });
    this._artefactService.register('Case', {
      icon: 'glyphicon-minus',
      iconNg2: 'minus',
      component: CaseComponent,
      description: 'Same as in any programming language, to use in combinaison with the "Switch" control',
    });
    this._artefactService.register('RetryIfFails', {
      icon: 'glyphicon-retweet',
      iconNg2: 'repeat',
      component: RetryIfFailsComponent,
      description: 'Retry mechanism with grace period',
    });
    this._artefactService.register('Check', {
      icon: 'glyphicon-ok',
      iconNg2: 'check',
      component: CheckComponent,
      description:
        'Performs a custom assertion using groovy expressions. Useful for validating the output of the parent node. For standard assertions use the Control Assert instead',
    });
    this._artefactService.register('Assert', {
      icon: 'glyphicon-ok',
      iconNg2: 'check',
      component: AssertComponent,
      description: 'Validates the output of a keyword execution.',
    });
    this._artefactService.register('Placeholder', {
      icon: 'glyphicon-unchecked',
      iconNg2: 'square',
      component: PlaceholderComponent,
      description: '',
    });
    this._artefactService.register('Export', {
      icon: 'glyphicon-export',
      iconNg2: 'upload',
      component: ExportComponent,
      description: '',
    });
    this._artefactService.register('Failure', {
      icon: 'glyphicon-thumbs-down',
      iconNg2: 'thumbs-down',
      form: '',
      description: '',
      isSelectable: false,
    });
  }
}
