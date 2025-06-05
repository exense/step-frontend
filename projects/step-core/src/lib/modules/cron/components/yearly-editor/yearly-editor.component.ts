import { Component } from '@angular/core';
import { MonthlyEditorComponent } from '../monthly-editor/monthly-editor.component';

@Component({
  selector: 'step-yearly-editor',
  templateUrl: './yearly-editor.component.html',
  styleUrls: ['./yearly-editor.component.scss'],
  standalone: false,
})
export class YearlyEditorComponent extends MonthlyEditorComponent {}
