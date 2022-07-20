import { Injectable } from '@angular/core';
import { PlansService } from '@exense/step-core';
import { map } from 'rxjs';

export type ArtefactType = {
  label?: string;
  icon: string;
  form: string;
  description: string;
  isSelectable?: boolean;
};

@Injectable({
  providedIn: 'root',
})
export class ArtefactService {
  public availableArtefacts?: Array<ArtefactType>; // artefacts loaded from server and enriched with info from the registry
  private registry: { [key: string]: ArtefactType } = {}; // maps artefact names to additional artefact details

  constructor(private _planApiService: PlansService) {
    this.fillArtefactsRegistry();
    this.fetchArtefacts();
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

  public register(typeName: string, artefactType: ArtefactType): void {
    if (!artefactType.label) {
      artefactType.label = typeName;
    }
    if (!('isSelectable' in artefactType)) {
      artefactType.isSelectable = true;
    }
    this.registry[typeName] = artefactType;
  }

  public getDefaultIcon(): string {
    return 'glyphicon-unchecked';
  }

  public isSelectable(typeName: string): boolean {
    return this.typeExist(typeName) && !!this.getType(typeName).isSelectable;
  }

  private fetchArtefacts(): void {
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

  private fillArtefactsRegistry(): void {
    this.register('TestSet', {
      icon: 'glyphicon-folder-close',
      form: 'partials/artefacts/testSet.html',
      description: 'Used to group up TestCase’s as a single unit and executing them in parallel',
    });
    this.register('TestCase', {
      icon: 'glyphicon-list-alt',
      form: 'partials/artefacts/testCase.html',
      description:
        'Specific container for a group of nodes, it will activate the top-level panel in the execution view for high-level test case execution monitoring',
    });
    this.register('TestScenario', {
      icon: 'glyphicon-equalizer',
      form: 'partials/artefacts/testScenario.html',
      description: 'Usually used to parallelize the execution of multiple ThreadGroups or ‘sub’ plans',
    });
    this.register('CallPlan', {
      icon: 'glyphicon-new-window',
      form: 'partials/artefacts/callPlan.html',
      description: 'Used to invoke a plan from within another plan',
    });
    this.register('CallKeyword', {
      icon: 'glyphicon-record',
      form: 'partials/artefacts/callFunction.html',
      description:
        'Technical node used as part of keyword invocation. Can be used explicitly in order to call a keyword by reflection',
    });
    this.register('For', {
      icon: 'glyphicon-th',
      form: 'partials/artefacts/for.html',
      description: 'Creates a For loop at execution time and iterates through its children',
    });
    this.register('ForEach', {
      icon: 'glyphicon-th',
      form: 'partials/artefacts/forEach.html',
      description: 'Creates a ForEach loop based on a collection and iterates through the child nodes',
    });
    this.register('While', {
      icon: 'glyphicon-repeat',
      form: 'partials/artefacts/while.html',
      description: 'Iterates over the node content until the given condition is not met',
    });
    this.register('DataSet', {
      icon: 'glyphicon-th-large',
      form: 'partials/artefacts/dataSet.html',
      description: 'Used to iterate over rows of data in a table',
    });
    this.register('Synchronized', {
      icon: 'glyphicon-align-justify',
      form: 'partials/artefacts/synchronized.html',
      description:
        'Guarantee thread safety within a test block by synchronizing all threads on the entire Test Execution',
    });
    this.register('Sequence', {
      icon: 'glyphicon-align-justify',
      form: 'partials/artefacts/sequence.html',
      description: 'Guarantees the ordering of the child nodes, as displayed in the tree.',
    });
    this.register('BeforeSequence', {
      icon: 'glyphicon-arrow-up',
      form: 'partials/artefacts/sequence.html',
      description: '',
    });
    this.register('AfterSequence', {
      icon: 'glyphicon-arrow-down',
      form: 'partials/artefacts/sequence.html',
      description: '',
    });
    this.register('Return', {
      icon: 'glyphicon-share-alt',
      form: 'partials/artefacts/return.html',
      description: 'Used within a Composite Keyword, set the Composite output to the returned value(s)',
    });
    this.register('Echo', {
      icon: 'glyphicon-zoom-in',
      form: 'partials/artefacts/echo.html',
      description: 'Used to print data in the report nodes of a plan, mostly for debugging or information purposes',
    });
    this.register('If', {
      icon: 'glyphicon-unchecked',
      form: 'partials/artefacts/if.html',
      description: 'Only executes the child nodes if the condition is met',
    });
    this.register('Session', {
      icon: 'glyphicon-magnet',
      form: 'partials/artefacts/functionGroup.html',
      description: 'Guarantees that Keywords are executed within the the same Session i.e. Agent Token',
    });
    this.register('Set', {
      icon: 'glyphicon-save',
      form: 'partials/artefacts/set.html',
      description: 'Sets a value to a variable, which can then be accessed throughout Plans and sub Plans',
    });
    this.register('Sleep', {
      icon: 'glyphicon-hourglass',
      form: 'partials/artefacts/sleep.html',
      description: 'Causes the thread to sleep',
    });
    this.register('Script', {
      icon: 'glyphicon-align-left',
      form: 'partials/artefacts/script.html',
      description:
        'Executes any arbitrary groovy code. The script context is local, which means that variable used in the script control cannot be accessed externally by other nodes',
    });
    this.register('ThreadGroup', {
      icon: 'glyphicon-resize-horizontal',
      form: 'partials/artefacts/threadGroup.html',
      description: 'Starts multiple threads which will execute the node content in parallel',
    });
    this.register('BeforeThread', {
      icon: 'glyphicon-arrow-left',
      form: 'partials/artefacts/sequence.html',
      description: '',
    });
    this.register('AfterThread', {
      icon: 'glyphicon-arrow-right',
      form: 'partials/artefacts/sequence.html',
      description: '',
    });
    this.register('Thread', {
      icon: 'glyphicon-resize-horizontal',
      form: 'partials/artefacts/threadGroup.html',
      description: '',
      isSelectable: false,
    });
    this.register('Switch', {
      icon: 'glyphicon-option-vertical',
      form: 'partials/artefacts/switch.html',
      description: 'Same as in any programming language, to use in combinaison with the "Case" control',
    });
    this.register('Case', {
      icon: 'glyphicon-minus',
      form: 'partials/artefacts/case.html',
      description: 'Same as in any programming language, to use in combinaison with the "Switch" control',
    });
    this.register('RetryIfFails', {
      icon: 'glyphicon-retweet',
      form: 'partials/artefacts/retryIfFails.html',
      description: 'Retry mechanism with grace period',
    });
    this.register('Check', {
      icon: 'glyphicon-ok',
      form: 'partials/artefacts/check.html',
      description:
        'Performs a custom assertion using groovy expressions. Useful for validating the output of the parent node. For standard assertions use the Control Assert instead',
    });
    this.register('Assert', {
      icon: 'glyphicon-ok',
      form: 'partials/artefacts/assert.html',
      description: 'Validates the output of a keyword execution.',
    });
    this.register('Placeholder', {
      icon: 'glyphicon-unchecked',
      form: 'partials/artefacts/placeholder.html',
      description: '',
    });
    this.register('Export', {
      icon: 'glyphicon-export',
      form: 'partials/artefacts/export.html',
      description: '',
    });
  }
}
