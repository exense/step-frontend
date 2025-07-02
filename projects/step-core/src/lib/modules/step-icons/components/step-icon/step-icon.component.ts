import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  Inject,
  Input,
  OnChanges,
  Renderer2,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { IconProviderService } from '../../services/icon-provider.service';

@Component({
  selector: 'step-icon',
  templateUrl: './step-icon.component.html',
  styleUrls: ['./step-icon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class StepIconComponent implements OnChanges {
  private _iconProvider = inject(IconProviderService);
  private _element = inject<ElementRef<HTMLElement>>(ElementRef);
  private _renderer = inject(Renderer2);

  @Input() name?: string;

  ngOnChanges(changes: SimpleChanges): void {
    const cName = changes['name'];
    if (cName?.previousValue !== cName?.currentValue || cName?.firstChange) {
      const iconKey = cName?.currentValue || '';
      const icon = this._iconProvider.getIcon(iconKey);
      if (icon) {
        this._renderer.setProperty(this._element.nativeElement, 'innerHTML', icon);
      }
    }
  }
}
