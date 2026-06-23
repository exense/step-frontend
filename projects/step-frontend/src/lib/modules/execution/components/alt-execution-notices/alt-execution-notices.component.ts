import { Component, input } from '@angular/core';
import {
  ResolvedExecutionNotice,
  STORE_ALL,
  tablePersistenceConfigProvider,
  TableMemoryStorageService,
  TablePersistenceStateService,
  TableStorageService,
} from '@exense/step-core';

@Component({
  selector: 'step-alt-execution-notices',
  templateUrl: './alt-execution-notices.component.html',
  styleUrl: './alt-execution-notices.component.scss',
  providers: [
    {
      provide: TableStorageService,
      useClass: TableMemoryStorageService,
    },
    TablePersistenceStateService,
    tablePersistenceConfigProvider('executionNoticesList', STORE_ALL),
  ],
  standalone: false,
})
export class AltExecutionNoticesComponent {
  readonly notices = input<ResolvedExecutionNotice[]>([]);
}
