import { inject, Pipe, PipeTransform } from '@angular/core';
import { Plan } from '@exense/step-core';
import { ControlDropInfoFactoryService } from '../../../injectables/control-drop-info-factory.service';
import { ControlDropInfo } from '../../../types/control-drop-info.interface';

@Pipe({
  name: 'planDropInfo',
})
export class PlanDropInfoPipe implements PipeTransform {
  private _controlDropInfoFactory = inject(ControlDropInfoFactoryService);
  transform(value: Plan): ControlDropInfo {
    return this._controlDropInfoFactory.plan(value);
  }
}
