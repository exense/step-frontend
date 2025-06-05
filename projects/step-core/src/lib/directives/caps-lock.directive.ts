import { Directive, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({
  selector: '[stepCapsLock]',
  standalone: false,
})
export class CapsLockDirective {
  @Output('stepCapsLock') capsLock = new EventEmitter<boolean>();

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    const capsOn = event.getModifierState && event.getModifierState('CapsLock');
    this.capsLock.emit(capsOn);
  }
  @HostListener('window:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent): void {
    const capsOn = event.getModifierState && event.getModifierState('CapsLock');
    this.capsLock.emit(capsOn);
  }
}
