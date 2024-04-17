import { Component, inject, input, output } from '@angular/core';
import { BulkSelectionType, SelectionCollector } from '@exense/step-core';

@Component({
  selector: 'step-entity-selection-control',
  templateUrl: './entity-selection-control.component.html',
  styleUrl: './entity-selection-control.component.scss',
})
export class EntitySelectionControlComponent {
  protected _selectionCollector = inject(SelectionCollector, { optional: true })!;
  protected selectionType = BulkSelectionType.NONE;

  addButtonHint = input<string>('');
  add = output();
}
