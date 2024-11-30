import { Component, viewChild, ViewEncapsulation } from '@angular/core';
import { CustomFormComponent } from '@exense/step-core';
import { ExecutionCommandsContext } from '../../shared/execution-commands-context.interface';
import { ExecutionCommandsService } from '../../services/execution-commands.service';
import { ExecutionCommandsDirective } from '../../directives/execution-commands.directive';

@Component({
  selector: 'step-execution-commands',
  templateUrl: './execution-commands.component.html',
  styleUrls: ['./execution-commands.component.scss'],
  providers: [ExecutionCommandsService],
  encapsulation: ViewEncapsulation.None,
})
export class ExecutionCommandsComponent extends ExecutionCommandsDirective implements ExecutionCommandsContext {
  /** @ViewChild() **/
  private customForms = viewChild(CustomFormComponent);

  override getCustomForms(): CustomFormComponent | undefined {
    return this.customForms();
  }
}
