import { Directive, ElementRef, inject } from '@angular/core';
import { DROP_AREA_ID, GROUP_DROP_AREA_ID } from '../injectables/drop-area-id.token';

const dropAreaIdFactory = () => {
  const _elRef = inject<ElementRef<HTMLElement>>(ElementRef, { self: true });
  return _elRef.nativeElement.getAttribute('stepDropAreaId');
};

@Directive({
  selector: ':not([stepDragDropGroupContainer])[stepDropAreaId]',
  providers: [
    {
      provide: DROP_AREA_ID,
      useFactory: dropAreaIdFactory,
    },
  ],
})
export class DropAreaIdDirective {}

@Directive({
  selector: '[stepDragDropGroupContainer][stepDropAreaId]',
  providers: [
    {
      provide: GROUP_DROP_AREA_ID,
      useFactory: dropAreaIdFactory,
    },
  ],
})
export class GroupDropAreaIdDirective {}
