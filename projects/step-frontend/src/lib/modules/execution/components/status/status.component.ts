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
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { AJS_MODULE } from '@exense/step-core';

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
  @Input() showFullWidth: boolean = false;

  constructor(private _renderer: Renderer2) {}

  ngOnChanges(changes: SimpleChanges): void {
    const cStatus = changes['status'];
    if (cStatus?.currentValue === cStatus?.previousValue && !cStatus?.firstChange) {
      return;
    }

    let { previousValue, currentValue } = cStatus || { previousValue: undefined, currentValue: undefined };

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

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepStatus', downgradeComponent({ component: StatusComponent }));
