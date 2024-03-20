import { inject, Pipe, PipeTransform } from '@angular/core';
import { MultipleProjectsService } from '../injectables/multiple-projects.service';

@Pipe({
  name: 'projectName',
})
export class ProjectNamePipe implements PipeTransform {
  private _projects = inject(MultipleProjectsService);

  transform<T extends { attributes?: Record<string, string> }>(entity: T): string {
    return this._projects.getEntityProject(entity)?.name ?? '';
  }
}
