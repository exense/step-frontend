import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Inject,
  Input,
  OnChanges,
  Renderer2,
  SimpleChanges,
  ViewEncapsulation
} from '@angular/core';
import { IconProviderService } from '../../services/icon-provider.service';

@Component({
  selector: 'step-icon',
  templateUrl: './step-icon.component.html',
  styleUrls: ['./step-icon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class StepIconComponent implements OnChanges {

  @Input() name?: string;

  constructor(
    private iconProvider: IconProviderService,
    @Inject(ElementRef) private element: ElementRef,
    private renderer: Renderer2
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    const cName = changes['name'];
    if (cName?.previousValue !== cName?.currentValue || cName?.firstChange) {
      const iconKey = cName?.currentValue || '';
      const icon = this.iconProvider.getIcon(iconKey);
      if (icon) {
        this.renderer.setProperty(this.element.nativeElement, 'innerHTML', icon);
      }
    }
  }

}
