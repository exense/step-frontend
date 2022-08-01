import {
  AfterViewInit,
  Component,
  ComponentFactoryResolver,
  Injector,
  Input,
  OnChanges,
  SimpleChanges,
  Type,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';

@Component({
  selector: 'step-custom-item-render',
  templateUrl: './custom-item-render.component.html',
  styleUrls: ['./custom-item-render.component.scss'],
})
export class CustomItemRenderComponent implements OnChanges, AfterViewInit {
  @Input() component?: Type<unknown>;

  @ViewChild('container', { read: ViewContainerRef }) container!: ViewContainerRef;

  constructor(private _componentFactoryResolver: ComponentFactoryResolver, private _injector: Injector) {}

  ngAfterViewInit(): void {
    this.render(this.component);
  }

  ngOnChanges(changes: SimpleChanges): void {
    const cComponent = changes['component'];
    if (cComponent?.previousValue !== cComponent?.currentValue) {
      this.render(cComponent?.currentValue);
    }
  }

  private render(component?: Type<unknown>): void {
    if (!this.container) {
      return;
    }

    if (!component) {
      this.container.clear();
      return;
    }

    const componentFactory = this._componentFactoryResolver.resolveComponentFactory(component);
    this.container.createComponent(componentFactory, undefined, this._injector);
  }
}
