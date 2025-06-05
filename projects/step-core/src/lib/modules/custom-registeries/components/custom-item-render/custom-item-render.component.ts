import {
  AfterViewInit,
  Component,
  ComponentRef,
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
  standalone: false,
})
export class CustomItemRenderComponent implements OnChanges, AfterViewInit {
  @Input() component?: Type<CustomComponent>;
  @Input() context?: any;
  @Input() artefactId?: string;

  @ViewChild('container', { read: ViewContainerRef }) container!: ViewContainerRef;

  private componentRef?: ComponentRef<CustomComponent>;

  get componentInstance(): CustomComponent | undefined {
    return this.componentRef?.instance;
  }

  ngAfterViewInit(): void {
    // Rendering synchronously in `ngAfterViewInit` hook may cause `ExpressionChangedAfterItHasBeenCheckedError`
    // for some components. `queueMicrotask` invoke render asynchronously
    queueMicrotask(() => this.render(this.component));
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

    const cArtefactId = changes['artefactId'];
    if (cArtefactId?.previousValue !== cArtefactId?.currentValue) {
      // force a re-rendering since the component might have stayed the same but displays a different artefact
      this.render(this.component);
    }
  }

  private render(component?: Type<CustomComponent>): void {
    if (!this.container) {
      return;
    }

    this.container.clear();

    if (!component) {
      this.componentRef = undefined;
      return;
    }

    this.componentRef = this.container.createComponent(component);

    if (this.context) {
      this.updateContext(this.context);
    }
  }

  private updateContext(context?: any): void {
    if (!this.componentRef) {
      return;
    }
    const previousContext = this.componentRef.instance.context;
    this.componentRef.instance.context = context;
    this.componentRef.instance.contextChange?.(previousContext, context);
    this.componentRef.changeDetectorRef.detectChanges();
  }
}
