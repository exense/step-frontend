import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Output,
  Renderer2,
  SimpleChanges,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { TriggerHtmlPopoverDirective } from '../../directives/trigger-html-popover.directive';

@Component({
  selector: 'step-html-popover',
  templateUrl: './html-popover.component.html',
  styleUrls: ['./html-popover.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  exportAs: 'StepHtmlPopover',
  encapsulation: ViewEncapsulation.None,
})
export class HtmlPopoverComponent implements OnInit {
  @Input() htmlContent!: string;
  @Output() toggledEvent = new EventEmitter<boolean>();

  @ViewChild('htmlContentTemplate') htmlContentTemplate?: TemplateRef<any>;
  @ViewChild(TriggerHtmlPopoverDirective, { static: true })
  private readonly triggerHtmlPopoverDirective!: TriggerHtmlPopoverDirective;
  private toggled = false;

  protected isMouseOverPopover = false;

  private renderer = Inject(Renderer2);

  constructor(private readonly elementRef: ElementRef) {}

  ngOnInit(): void {
    this.elementRef.nativeElement.addEventListener('click', this.togglePopover.bind(this));
    this.elementRef.nativeElement.addEventListener('mouseenter', this.onPopoverMouseEnter.bind(this));
    this.elementRef.nativeElement.addEventListener('mouseleave', this.onPopoverMouseLeave.bind(this));
  }

  ngOnChanges(changes: SimpleChanges): void {
    const cHtmlContent = changes['htmlContent'];
    if (cHtmlContent?.previousValue !== cHtmlContent?.currentValue || cHtmlContent?.firstChange) {
      this.createTemplateFromHtml();
    }
  }

  private togglePopover() {
    this.toggled = !this.toggled;
    this.toggled ? this.triggerHtmlPopoverDirective.openMenu() : this.triggerHtmlPopoverDirective.closeMenu();
    this.toggledEvent.emit(this.toggled);
  }

  private createTemplateFromHtml() {
    const template = this.renderer.createElement('ng-template');
    this.renderer.setProperty(template, 'ngForOf', [null]);
    this.renderer.setProperty(template, 'ngForTemplate', this.htmlContentTemplate);
    this.renderer.appendChild(this.elementRef.nativeElement, template);
  }

  protected onPopoverMouseEnter() {
    this.isMouseOverPopover = true;
    this.triggerHtmlPopoverDirective.openMenu();
  }

  protected onPopoverMouseLeave() {
    this.isMouseOverPopover = false;
    this.closePopover();
  }

  private closePopover(force = false) {
    if (force) {
      this.triggerHtmlPopoverDirective.closeMenu();
      return;
    }

    if (!this.toggled) {
      setTimeout(() => {
        if (!this.isMouseOverPopover) {
          this.triggerHtmlPopoverDirective.closeMenu();
        }
      }, 400);
    }
  }

  log() {
    console.log('click2');
  }
}
