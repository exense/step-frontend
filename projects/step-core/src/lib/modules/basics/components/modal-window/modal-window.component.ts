import { Component, ElementRef, HostBinding, Input, ViewChild } from '@angular/core';
import { BaseModalWindowComponent } from './base-modal-window.component';

@Component({
  selector: 'step-modal-window',
  templateUrl: './modal-window.component.html',
  styleUrls: ['./modal-window.component.scss'],
})
export class ModalWindowComponent extends BaseModalWindowComponent {
  @ViewChild('trackFocus', { static: true })
  private trackFocus!: ElementRef<HTMLInputElement>;

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
    this.trackFocus.nativeElement.focus();
  }
}
