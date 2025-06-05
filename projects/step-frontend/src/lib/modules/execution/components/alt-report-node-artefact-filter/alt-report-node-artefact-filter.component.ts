import { Component, inject } from '@angular/core';
import { KeyValue } from '@angular/common';
import { ArrayItemLabelValueExtractor, ArtefactClass } from '@exense/step-core';
import { AltReportNodesFilterService } from '../../services/alt-report-nodes-filter.service';

type Item = KeyValue<ArtefactClass, string>;

const createItem = (key: ArtefactClass, value: string): Item => ({ key, value });

@Component({
  selector: 'step-alt-report-node-artefact-filter',
  templateUrl: './alt-report-node-artefact-filter.component.html',
  styleUrl: './alt-report-node-artefact-filter.component.scss',
  standalone: false,
})
export class AltReportNodeArtefactFilterComponent {
  private _state = inject(AltReportNodesFilterService);

  protected readonly items = [
    createItem(ArtefactClass.KEYWORD, 'Keyword'),
    createItem(ArtefactClass.TEST_CASE, 'Test Case'),
    createItem(ArtefactClass.SLEEP, 'Sleep'),
    createItem(ArtefactClass.ECHO, 'Echo'),
    createItem(ArtefactClass.WAIT_FOR_EVENT, 'Wait For Event'),
    createItem(ArtefactClass.THREAD_GROUP, 'Thread Group'),
    createItem(ArtefactClass.FOR, 'For'),
    createItem(ArtefactClass.FOR_EACH, 'For Each'),
    createItem(ArtefactClass.SEQUENCE, 'Sequence'),
    createItem(ArtefactClass.TEST_SCENARIO, 'Test Scenario'),
    createItem(ArtefactClass.TEST_SET, 'Test Set'),
    createItem(ArtefactClass.CHECK, 'Check'),
    createItem(ArtefactClass.ASSERT, 'Assert'),
    createItem(ArtefactClass.PERFORMANCE_ASSERT, 'Performance Assert'),
  ].sort((a, b) => a.value.localeCompare(b.value));

  protected readonly itemValueExtractor: ArrayItemLabelValueExtractor<Item, ArtefactClass> = {
    getLabel: (item) => item.value,
    getValue: (item) => item.key,
  };

  protected readonly artefactClassValue = this._state.artefactClassArrayValue;

  protected handleArtefactClassValueChange(value: string[]): void {
    this._state.artefactClassCtrl.setValue(value);
  }
}
