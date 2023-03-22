import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'stepCalcViewportHeightMinusOffsetTop',
  pure: false,
})
export class CalcViewportHeightMinusOffsetTopPipe implements PipeTransform {
  transform(element: HTMLElement): string {
    return `calc(100vh - ${element.getBoundingClientRect().top}px)`;
  }
}
