import { ChangeDetectionStrategy, Component, computed, inject, input, ViewEncapsulation } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { HelpMessage } from '../../types/help-message';

@Component({
  selector: 'step-help-message',
  templateUrl: './help-message.component.html',
  styleUrl: './help-message.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class HelpMessageComponent {
  private _sanitizer = inject(DomSanitizer);

  readonly help = input.required<HelpMessage>();

  protected readonly safeHtml = computed((): SafeHtml => {
    const help = this.help();
    return this._sanitizer.bypassSecurityTrustHtml(help.html);
  });
}
