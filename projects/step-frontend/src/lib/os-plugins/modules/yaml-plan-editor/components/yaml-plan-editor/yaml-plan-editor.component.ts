import { Component } from '@angular/core';
import { AceMode, CustomComponent } from '@exense/step-core';

@Component({
  selector: 'step-yaml-plan-editor',
  templateUrl: './yaml-plan-editor.component.html',
  styleUrl: './yaml-plan-editor.component.scss',
  standalone: false,
})
export class YamlPlanEditorComponent implements CustomComponent {
  context?: unknown;
  protected readonly AceMode = AceMode;
}
