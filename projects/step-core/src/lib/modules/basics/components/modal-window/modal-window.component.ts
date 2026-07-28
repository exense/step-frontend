import { Component, ElementRef, input, viewChild } from '@angular/core';
import { BaseModalWindowComponent } from './base-modal-window.component';

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
  private readonly trackFocus = viewChild('trackFocus', { read: ElementRef<HTMLInputElement> });
  private readonly dialogContent = viewChild('dialogContent', { read: ElementRef<HTMLElement> });

  readonly showSpinner = input<boolean | unknown>(false);
  readonly spinnerTooltip = input<string>('');
  readonly title = input('');
  readonly hideButtonsSection = input(false);
  readonly hideHeaderSection = input(false);

  override focusDialog(): void {
    this.trackFocus()?.nativeElement?.focus();
  }

  scrollTop(): void {
    const content = this.dialogContent()?.nativeElement;
    content?.scrollTo(0, 0);
  }
}
