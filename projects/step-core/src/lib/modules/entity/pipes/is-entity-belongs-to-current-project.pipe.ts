import { inject, Pipe, PipeTransform } from '@angular/core';
import { MultipleProjectsService } from '../../basics/step-basics.module';

@Pipe({
  name: 'isEntityBelongsToCurrentProject',
})
export class IsEntityBelongsToCurrentProjectPipe implements PipeTransform {
  private _multipleProjectsService = inject(MultipleProjectsService);

  transform<T extends { attributes?: Record<string, string> }>(entity: T): boolean {
    return this._multipleProjectsService.isEntityBelongsToCurrentProject(entity);
  }
}
