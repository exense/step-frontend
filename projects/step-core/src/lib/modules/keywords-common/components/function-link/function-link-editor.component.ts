import { Component, EventEmitter, Output } from '@angular/core';
import { BaseFunctionLinkComponent } from './base-function-link.component';
import { CustomComponent } from '../../../custom-registeries/custom-registries.module';
import { Keyword } from '../../../../client/step-client-module';
import { StepBasicsModule } from '../../../basics/step-basics.module';

@Component({
  selector: 'step-function-link-editor',
  templateUrl: './function-link.component.html',
  styleUrls: ['./function-link.component.scss'],
  imports: [StepBasicsModule]
})
export class FunctionLinkEditorComponent extends BaseFunctionLinkComponent implements CustomComponent {
  @Output() edit = new EventEmitter<void>();

  override handleLinkClick(): void {
    if (!this.context?.id || !this._functionActions) {
      return;
    }
    this.openEditor(this.context);
  }

  private openEditor(keyword: Keyword): void {
    this._functionActions!.openFunctionEditor(keyword).subscribe((continueEdit) => {
      if (continueEdit) {
        this.edit.emit();
      }
    });
  }
}
