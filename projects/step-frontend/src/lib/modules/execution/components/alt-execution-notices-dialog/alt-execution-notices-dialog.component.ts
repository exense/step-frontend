import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import {
  DateFormat,
  ExecutionNoticeSeverity,
  ResolvedExecutionNotice,
  STORE_ALL,
  TableLocalDataSource,
  TableMemoryStorageService,
  TablePersistenceStateService,
  TableStorageService,
  tablePersistenceConfigProvider,
} from '@exense/step-core';
import { EXECUTION_NOTICE_ICON } from '../../shared/execution-notice-severity';

export interface AltExecutionNoticesDialogData {
  notices: ResolvedExecutionNotice[];
}

@Component({
  selector: 'step-alt-execution-notices-dialog',
  templateUrl: './alt-execution-notices-dialog.component.html',
  styleUrl: './alt-execution-notices-dialog.component.scss',
  providers: [
    {
      provide: TableStorageService,
      useClass: TableMemoryStorageService,
    },
    TablePersistenceStateService,
    tablePersistenceConfigProvider('executionNoticesList', STORE_ALL),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class AltExecutionNoticesDialogComponent {
  private _sanitizer = inject(DomSanitizer);
  private _notices = inject<AltExecutionNoticesDialogData>(MAT_DIALOG_DATA).notices ?? [];

  protected readonly DateFormat = DateFormat;
  protected readonly severityItems: ExecutionNoticeSeverity[] = ['INFO', 'WARNING', 'ERROR'];

  protected severityIcon(severity: ExecutionNoticeSeverity): string {
    return EXECUTION_NOTICE_ICON[severity] ?? 'info';
  }

  private dataSourceConfig = TableLocalDataSource.configBuilder<ResolvedExecutionNotice>()
    .addSearchStringRegexPredicate('severity', (item) => item.severity)
    .addSearchStringPredicate('category', (item) => item.category)
    .addSearchStringPredicate('message', (item) => item.message)
    .addSortStringPredicate('severity', (item) => item.severity)
    .addSortStringPredicate('category', (item) => item.category)
    .addSortNumberPredicate('timestamp', (item) => item.timestamp)
    .build();

  protected readonly dataSource = new TableLocalDataSource(this._notices, this.dataSourceConfig);

  // See AltExecutionNoticeComponent: the message is HTML already sanitized server-side; bypass the
  // Angular sanitizer so embedded links (incl. target="_blank") survive.
  protected trustMessage(message: string): SafeHtml {
    return this._sanitizer.bypassSecurityTrustHtml(message);
  }
}
