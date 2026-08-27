import { Component, ElementRef, inject, input, Signal, signal, viewChild } from '@angular/core';
import { BaseModalWindowComponent } from './base-modal-window.component';
import { ProjectScopeWarning, ProjectScopeWarningService } from '../../injectables/project-scope-warning.service';

@Component({
  selector: 'step-modal-window',
  templateUrl: './modal-window.component.html',
  styleUrls: ['./modal-window.component.scss'],
  standalone: false,
  /**
   * This component has an input "title" which also works as assignment
   * of native html title attribute.
   * It might cause some negative effects, when modal title appears on hover.
   * This binding was added to negate this negative effect.
   */
  host: {
    '[attr.title]': 'null',
  },
})
export class ModalWindowComponent extends BaseModalWindowComponent {
  private _projectScopeWarning = inject(ProjectScopeWarningService, { optional: true });

  private readonly trackFocus = viewChild('trackFocus', { read: ElementRef<HTMLInputElement> });
  private readonly dialogContent = viewChild('dialogContent', { read: ElementRef<HTMLElement> });

  readonly showSpinner = input<boolean | unknown>(false);
  readonly spinnerTooltip = input<string>('');
  readonly title = input('');
  readonly hideButtonsSection = input(false);
  readonly hideHeaderSection = input(false);
  protected readonly projectScopeWarning: Signal<ProjectScopeWarning | undefined> =
    this._projectScopeWarning?.warning ?? signal<ProjectScopeWarning | undefined>(undefined);

  override focusDialog(): void {
    this.trackFocus()?.nativeElement?.focus();
  }

  scrollTop(): void {
    const content = this.dialogContent()?.nativeElement;
    content?.scrollTo(0, 0);
  }
}
