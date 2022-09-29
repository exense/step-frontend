import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnChanges,
  Renderer2,
  SimpleChanges,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'step-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusComponent implements OnChanges {
  @ViewChild('container', { static: true })
  private container!: ElementRef;

  @Input() status?: string;

  constructor(private _renderer: Renderer2) {}

  ngOnChanges(changes: SimpleChanges): void {
    const cStatus = changes['status'];
    if (!cStatus || cStatus.currentValue === cStatus.previousValue) {
      return;
    }

    let { previousValue, currentValue } = cStatus;

    previousValue = previousValue ? `step-${previousValue}` : undefined;
    currentValue = currentValue ? `step-${currentValue}` : undefined;

    if (previousValue) {
      this._renderer.removeClass(this.container.nativeElement, previousValue);
    }

    if (currentValue) {
      this._renderer.addClass(this.container.nativeElement, currentValue);
    }
  }
}
