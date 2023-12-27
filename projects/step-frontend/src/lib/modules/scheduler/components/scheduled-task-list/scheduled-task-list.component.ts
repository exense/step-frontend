import { AfterViewInit, Component, inject } from '@angular/core';
import {
  AutoDeselectStrategy,
  ExecutiontTaskParameters,
  selectionCollectionProvider,
  tablePersistenceConfigProvider,
  STORE_ALL,
  ArrayItemLabelValueExtractor,
  FilterConditionFactoryService,
} from '@exense/step-core';
import { ScheduledTaskLogicService } from '../../services/scheduled-task-logic.service';
import { KeyValue } from '@angular/common';

type StatusItem = KeyValue<string, string>;

@Component({
  selector: 'step-scheduled-task-list',
  templateUrl: './scheduled-task-list.component.html',
  styleUrls: ['./scheduled-task-list.component.scss'],
  providers: [
    tablePersistenceConfigProvider('scheduledTaskList', STORE_ALL),
    ScheduledTaskLogicService,
    ...selectionCollectionProvider<string, ExecutiontTaskParameters>('id', AutoDeselectStrategy.DESELECT_ON_UNREGISTER),
  ],
})
export class ScheduledTaskListComponent implements AfterViewInit {
  readonly _logic = inject(ScheduledTaskLogicService);

  isSchedulerEnabled: boolean = false;

  readonly _filterConditionFactory = inject(FilterConditionFactoryService);

  readonly statusItems: StatusItem[] = [
    { key: true.toString(), value: this._logic.STATUS_ACTIVE_STRING },
    { key: false.toString(), value: this._logic.STATUS_INACTIVE_STRING },
  ];

  readonly extractor: ArrayItemLabelValueExtractor<StatusItem> = {
    getValue: (item) => item.key,
    getLabel: (item) => item.value,
  };

  ngOnInit(): void {
    this._logic.isSchedulerEnabled().subscribe((data) => {
      this.isSchedulerEnabled = data;
    });
  }

  ngAfterViewInit(): void {
    this._logic.resolveEditLinkIfExists();
  }
}
