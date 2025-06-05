import { Directive } from '@angular/core';

@Directive({
  selector: '[matColumnDef][stepActionCol]',
  standalone: false,
})
export class ActionColDirective {}
