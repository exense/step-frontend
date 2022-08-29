import {
  AfterViewInit,
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  Injector,
  Input,
  OnChanges,
  SimpleChanges,
  Type,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { CustomComponent } from '../../shared/custom-component';

@Component({
  selector: 'step-custom-item-render',
  templateUrl: './custom-item-render.component.html',
  styleUrls: ['./custom-item-render.component.scss'],
})
export class CustomItemRenderComponent implements OnChanges, AfterViewInit {
  @Input() component?: Type<CustomComponent>;
  @Input() context?: any;

  @ViewChild('container', { read: ViewContainerRef }) container!: ViewContainerRef;

  private componentRef?: ComponentRef<CustomComponent>;

  constructor(private _componentFactoryResolver: ComponentFactoryResolver, private _injector: Injector) {}

  ngAfterViewInit(): void {
    this.render(this.component);
  }

  ngOnChanges(changes: SimpleChanges): void {
    const cComponent = changes['component'];
    if (cComponent?.previousValue !== cComponent?.currentValue) {
      this.render(cComponent?.currentValue);
    }

    const cContext = changes['context'];
    if (cContext?.previousValue !== cContext?.currentValue) {
      this.updateContext(cContext?.currentValue);
    }
  }

  private render(component?: Type<CustomComponent>): void {
    if (!this.container) {
      return;
    }

    if (!component) {
      this.componentRef = undefined;
      this.container.clear();
      return;
    }

    const componentFactory = this._componentFactoryResolver.resolveComponentFactory(component);
    this.componentRef = this.container.createComponent(componentFactory, undefined, this._injector);
    if (this.context) {
      this.updateContext(this.context);
    }
  }

  private updateContext(context?: any) {
    if (!this.componentRef) {
      return;
    }
    this.componentRef.instance.context = context;
    this.componentRef.changeDetectorRef.markForCheck();
  }
}
