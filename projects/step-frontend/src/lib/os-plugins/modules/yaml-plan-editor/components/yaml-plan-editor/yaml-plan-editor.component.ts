import { Component, signal, TemplateRef } from '@angular/core';
import { AceMode, CustomComponent, PlanTypeContext } from '@exense/step-core';

@Component({
  selector: 'step-yaml-plan-editor',
  templateUrl: './yaml-plan-editor.component.html',
  styleUrl: './yaml-plan-editor.component.scss',
  standalone: false,
})
export class YamlPlanEditorComponent implements CustomComponent {
  protected readonly AceMode = AceMode;
  protected readonly templateControls = signal<TemplateRef<unknown> | undefined>(undefined);
  contextChange(previousContext?: PlanTypeContext, currentContext?: PlanTypeContext): void {
    this.templateControls.set(currentContext?.templateControls);
  }
}
