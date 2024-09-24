import { Component, ElementRef, HostBinding, Input, viewChild } from '@angular/core';
import { BaseModalWindowComponent } from './base-modal-window.component';

@Component({
  selector: 'step-modal-window',
  templateUrl: './modal-window.component.html',
  styleUrls: ['./modal-window.component.scss'],
})
export class ModalWindowComponent extends BaseModalWindowComponent {
  /* @ViewChild() */
  private trackFocus = viewChild('trackFocus', { read: ElementRef<HTMLInputElement> });

  /* @ViewChild() */
  private dialogContent = viewChild('dialogContent', { read: ElementRef<HTMLElement> });

  /**
   * This component has an input "title" which also works as assignment
   * of native html title attribute.
   * It might cause some negative effects, when modal title appears on hover.
   * This binding was added to negate this negative effect.
   */
  @HostBinding('attr.title') private nativeTitle = null;

  @Input() showSpinner?: boolean;
  @Input() title = '';
  @Input() hideButtonsSection = false;

  override focusDialog() {
    this.trackFocus()?.nativeElement?.focus();
  }

  scrollTop(): void {
    const content = this.dialogContent()?.nativeElement;
    content?.scrollTo(0, 0);
  }
}
