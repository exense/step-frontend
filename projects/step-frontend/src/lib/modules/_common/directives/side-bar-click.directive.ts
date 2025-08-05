import { Directive, HostListener, output } from '@angular/core';

@Directive({
  selector: '[stepSideBarClick]',
  standalone: false,
})
export class SideBarClickDirective {
  /**
   * @Output()
   * **/
  readonly clickEmitter = output<MouseEvent>({
    alias: 'stepSideBarClick',
  });

  private isMouseDownRegistered = false;

  @HostListener('mousedown', ['$event'])
  private handleMouseDown(event: MouseEvent): void {
    this.isMouseDownRegistered = true;
  }

  @HostListener('mouseup', ['$event'])
  private handleMouseUp(event: MouseEvent): void {
    if (!this.isMouseDownRegistered) {
      return;
    }
    this.isMouseDownRegistered = false;
    this.clickEmitter.emit(event);
  }
}
