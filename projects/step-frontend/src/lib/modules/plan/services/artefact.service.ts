import { Injectable } from '@angular/core';
import { AJS_MODULE, AuthService, PlansService } from '@exense/step-core';
import { map } from 'rxjs';
import { downgradeInjectable, getAngularJSGlobal } from '@angular/upgrade/static';

export type ArtefactType = {
  label?: string;
  icon: string;
  iconNg2: string;
  form: string;
  description: string;
  isSelectable?: boolean;
};

@Injectable({
  providedIn: 'root',
})
export class ArtefactService {
  availableArtefacts?: Array<ArtefactType>; // artefacts loaded from server and enriched with info from the registry
  private registry: { [key: string]: ArtefactType } = {}; // maps artefact names to additional artefact details, provided statically in fillArtefactsRegistry()

  constructor(private _planApiService: PlansService) {
    this.fillArtefactsRegistry();
  }

  fetchAndProvideAvailableArtefacts(): void {
    this._planApiService
      .getArtefactTypes()
      .pipe(
        map((artefactNames: Array<string>) => {
          return artefactNames
            .filter((artefactName) => this.isSelectable(artefactName))
            .map((artefactName) => this.getType(artefactName));
        })
      )
      .subscribe((artifacts) => {
        this.availableArtefacts = artifacts;
      });
  }

  private getType(typeName: string): ArtefactType {
    if (this.registry[typeName]) {
      return this.registry[typeName];
    } else {
      throw 'Unknown artefact type ' + typeName;
    }
  }

  private typeExist(typeName: string): boolean {
    return this.registry[typeName] != null;
  }

  register(typeName: string, artefactType: ArtefactType): void {
    if (!artefactType.label) {
      artefactType.label = typeName;
    }
    if (!('isSelectable' in artefactType)) {
      artefactType.isSelectable = true;
    }
    this.registry[typeName] = artefactType;
  }

  /* @deprecated legacy */
  getEditor(typeName: string) {
    return this.getType(typeName).form;
  }
  /* @deprecated legacy */
  getDefaultIcon(): string {
    return 'glyphicon-unchecked';
  }
  /* @deprecated legacy */
  getIcon(typeName: string) {
    return this.getType(typeName).icon;
  }
  /* @deprecated legacy */
  getIconNg2(typeName: string) {
    return this.getType(typeName).iconNg2;
  }
  /* @deprecated legacy */
  getDescription(typeName: string) {
    return this.getType(typeName).description;
  }
  /* @deprecated legacy */
  getLabel(typeName: string): string {
    return this.getType(typeName).label || '';
  }
  /* @deprecated legacy */
  getTypes(): string[] {
    return Object.keys(this.registry);
  }

  isSelectable(typeName: string): boolean {
    return this.typeExist(typeName) && !!this.getType(typeName).isSelectable;
  }

  private fillArtefactsRegistry(): void {
    this.register('TestSet', {
      icon: 'glyphicon-folder-close',
      iconNg2: 'folder',
      form: 'partials/artefacts/testSet.html',
      description: 'Used to group up TestCase’s as a single unit and executing them in parallel',
    });
    this.register('TestCase', {
      icon: 'glyphicon-list-alt',
      iconNg2: 'list',
      form: 'partials/artefacts/testCase.html',
      description:
        'Specific container for a group of nodes, it will activate the top-level panel in the execution view for high-level test case execution monitoring',
    });
    this.register('TestScenario', {
      icon: 'glyphicon-equalizer',
      iconNg2: 'bar-chart-2',
      form: 'partials/artefacts/testScenario.html',
      description: 'Usually used to parallelize the execution of multiple ThreadGroups or ‘sub’ plans',
    });
    this.register('CallPlan', {
      icon: 'glyphicon-new-window',
      iconNg2: 'external-link',
      form: 'partials/artefacts/callPlan.html',
      description: 'Used to invoke a plan from within another plan',
    });
    this.register('CallKeyword', {
      icon: 'glyphicon-record',
      iconNg2: 'target',
      form: 'partials/artefacts/callFunction.html',
      description:
        'Technical node used as part of keyword invocation. Can be used explicitly in order to call a keyword by reflection',
    });
    this.register('For', {
      icon: 'glyphicon-th',
      iconNg2: 'cpu',
      form: 'partials/artefacts/for.html',
      description: 'Creates a For loop at execution time and iterates through its children',
    });
    this.register('ForEach', {
      icon: 'glyphicon-th',
      iconNg2: 'cpu',
      form: 'partials/artefacts/forEach.html',
      description: 'Creates a ForEach loop based on a collection and iterates through the child nodes',
    });
    this.register('While', {
      icon: 'glyphicon-repeat',
      iconNg2: 'rotate-cw',
      form: 'partials/artefacts/while.html',
      description: 'Iterates over the node content until the given condition is not met',
    });
    this.register('DataSet', {
      icon: 'glyphicon-th-large',
      iconNg2: 'grid',
      form: 'partials/artefacts/dataSet.html',
      description: 'Used to iterate over rows of data in a table',
    });
    this.register('Synchronized', {
      icon: 'glyphicon-align-justify',
      iconNg2: 'align-justify',
      form: 'partials/artefacts/synchronized.html',
      description:
        'Guarantee thread safety within a test block by synchronizing all threads on the entire Test Execution',
    });
    this.register('Sequence', {
      icon: 'glyphicon-align-justify',
      iconNg2: 'align-justify',
      form: 'partials/artefacts/sequence.html',
      description: 'Guarantees the ordering of the child nodes, as displayed in the tree.',
    });
    this.register('BeforeSequence', {
      icon: 'glyphicon-arrow-up',
      iconNg2: 'arrow-up',
      form: 'partials/artefacts/sequence.html',
      description: '',
    });
    this.register('AfterSequence', {
      icon: 'glyphicon-arrow-down',
      iconNg2: 'arrow-down',
      form: 'partials/artefacts/sequence.html',
      description: '',
    });
    this.register('Return', {
      icon: 'glyphicon-share-alt',
      iconNg2: 'corner-up-right',
      form: 'partials/artefacts/return.html',
      description: 'Used within a Composite Keyword, set the Composite output to the returned value(s)',
    });
    this.register('Echo', {
      icon: 'glyphicon-zoom-in',
      iconNg2: 'zoom-in',
      form: 'partials/artefacts/echo.html',
      description: 'Used to print data in the report nodes of a plan, mostly for debugging or information purposes',
    });
    this.register('If', {
      icon: 'glyphicon-unchecked',
      iconNg2: 'square',
      form: 'partials/artefacts/if.html',
      description: 'Only executes the child nodes if the condition is met',
    });
    this.register('Session', {
      icon: 'glyphicon-magnet',
      iconNg2: 'briefcase',
      form: 'partials/artefacts/functionGroup.html',
      description: 'Guarantees that Keywords are executed within the the same Session i.e. Agent Token',
    });
    this.register('Set', {
      icon: 'glyphicon-save',
      form: 'partials/artefacts/set.html',
      iconNg2: 'download',
      description: 'Sets a value to a variable, which can then be accessed throughout Plans and sub Plans',
    });
    this.register('Sleep', {
      icon: 'glyphicon-hourglass',
      iconNg2: 'coffee',
      form: 'partials/artefacts/sleep.html',
      description: 'Causes the thread to sleep',
    });
    this.register('Script', {
      icon: 'glyphicon-align-left',
      iconNg2: 'align-left',
      form: 'partials/artefacts/script.html',
      description:
        'Executes any arbitrary groovy code. The script context is local, which means that variable used in the script control cannot be accessed externally by other nodes',
    });
    this.register('ThreadGroup', {
      icon: 'glyphicon-resize-horizontal',
      iconNg2: 'code',
      form: 'partials/artefacts/threadGroup.html',
      description: 'Starts multiple threads which will execute the node content in parallel',
    });
    this.register('BeforeThread', {
      icon: 'glyphicon-arrow-left',
      iconNg2: 'chevron-left',
      form: 'partials/artefacts/sequence.html',
      description: '',
    });
    this.register('AfterThread', {
      icon: 'glyphicon-arrow-right',
      iconNg2: 'chevron-right',
      form: 'partials/artefacts/sequence.html',
      description: '',
    });
    this.register('Thread', {
      icon: 'glyphicon-resize-horizontal',
      iconNg2: 'code',
      form: 'partials/artefacts/threadGroup.html',
      description: '',
      isSelectable: false,
    });
    this.register('Switch', {
      icon: 'glyphicon-option-vertical',
      iconNg2: 'more-vertical',
      form: 'partials/artefacts/switch.html',
      description: 'Same as in any programming language, to use in combinaison with the "Case" control',
    });
    this.register('Case', {
      icon: 'glyphicon-minus',
      iconNg2: 'minus',
      form: 'partials/artefacts/case.html',
      description: 'Same as in any programming language, to use in combinaison with the "Switch" control',
    });
    this.register('RetryIfFails', {
      icon: 'glyphicon-retweet',
      iconNg2: 'repeat',
      form: 'partials/artefacts/retryIfFails.html',
      description: 'Retry mechanism with grace period',
    });
    this.register('Check', {
      icon: 'glyphicon-ok',
      iconNg2: 'check',
      form: 'partials/artefacts/check.html',
      description:
        'Performs a custom assertion using groovy expressions. Useful for validating the output of the parent node. For standard assertions use the Control Assert instead',
    });
    this.register('Assert', {
      icon: 'glyphicon-ok',
      iconNg2: 'check',
      form: 'partials/artefacts/assert.html',
      description: 'Validates the output of a keyword execution.',
    });
    this.register('Placeholder', {
      icon: 'glyphicon-unchecked',
      iconNg2: 'square',
      form: 'partials/artefacts/placeholder.html',
      description: '',
    });
    this.register('Export', {
      icon: 'glyphicon-export',
      iconNg2: 'upload',
      form: 'partials/artefacts/export.html',
      description: '',
    });
  }
}

getAngularJSGlobal().module(AJS_MODULE).service('artefactTypes', downgradeInjectable(ArtefactService));
