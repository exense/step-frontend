import { Component, viewChild, ViewEncapsulation } from '@angular/core';
import { CustomFormComponent, ExecutionCommandsContext } from '@exense/step-core';
import { ExecutionCommandsService } from '../../services/execution-commands.service';
import { ExecutionCommandsDirective } from '../../directives/execution-commands.directive';

@Component({
  selector: 'step-execution-commands',
  templateUrl: './execution-commands.component.html',
  styleUrls: ['./execution-commands.component.scss'],
  providers: [ExecutionCommandsService],
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class ExecutionCommandsComponent extends ExecutionCommandsDirective implements ExecutionCommandsContext {
  /** @ViewChild() **/
  private readonly customForms = viewChild(CustomFormComponent);

  // eslint-disable-next-line step-lint/component-public-fields -- The override implements the public execution context contract.
  override getCustomForms(): CustomFormComponent | undefined {
    return this.customForms();
  }
}
