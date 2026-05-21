import { inject, Pipe, PipeTransform } from '@angular/core';
import { MultipleProjectsService, Project } from '../../basics/step-basics.module';

@Pipe({
  name: 'entityProject',
})
export class EntityProjectPipe implements PipeTransform {
  private _multipleProjectsService = inject(MultipleProjectsService);

  transform<T extends { attributes?: Record<string, string> }>(entity: T): Project | undefined {
    return this._multipleProjectsService.getProject(entity);
  }
}
