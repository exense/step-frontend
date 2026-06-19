import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AlertType, ResolvedExecutionNotice } from '@exense/step-core';
import { EXECUTION_NOTICE_ALERT_TYPE, EXECUTION_NOTICE_ICON } from '../../shared/execution-notice-severity';

@Component({
  selector: 'step-alt-execution-notice',
  templateUrl: './alt-execution-notice.component.html',
  styleUrl: './alt-execution-notice.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class AltExecutionNoticeComponent {
  private _sanitizer = inject(DomSanitizer);

  readonly notice = input.required<ResolvedExecutionNotice>();

  protected readonly alertType = computed(() => EXECUTION_NOTICE_ALERT_TYPE[this.notice().severity] ?? AlertType.INFO);
  protected readonly icon = computed(() => EXECUTION_NOTICE_ICON[this.notice().severity] ?? 'info');

  // The notice message is HTML rendered by the backend, where all user-controlled values are already
  // escaped/sanitized server-side (per the API contract). We deliberately bypass Angular's sanitizer:
  // the default [innerHTML] sanitizer strips attributes we must keep — notably target="_blank" on the
  // <a> links the backend embeds — so binding the raw string would silently break those links.
  protected readonly safeMessage = computed<SafeHtml>(() =>
    this._sanitizer.bypassSecurityTrustHtml(this.notice().message),
  );
}
