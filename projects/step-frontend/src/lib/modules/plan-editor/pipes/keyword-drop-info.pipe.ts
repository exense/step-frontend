import { inject, Pipe, PipeTransform } from '@angular/core';
import { ControlDropInfoFactoryService } from '../injectables/control-drop-info-factory.service';
import { Keyword } from '@exense/step-core';
import { ControlDropInfo } from '../types/control-drop-info.interface';

@Pipe({
  name: 'keywordDropInfo',
  standalone: false,
})
export class KeywordDropInfoPipe implements PipeTransform {
  private _controlDropInfoFactory = inject(ControlDropInfoFactoryService);
  transform(value: Keyword): ControlDropInfo {
    return this._controlDropInfoFactory.keyword(value);
  }
}
