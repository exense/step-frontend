import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'editorStateText',
})
export class EditorStateTextPipe implements PipeTransform {
  transform(value: any): boolean {
    return true;
  }
}
