import { inject, Pipe, PipeTransform } from '@angular/core';
import { MultipleProjectsService } from '../../basics/step-basics.module';

@Pipe({
  name: 'entityEditorUrlForProject',
})
export class EntityEditorUrlForProjectPipe implements PipeTransform {
  private _multipleProjectsService = inject(MultipleProjectsService);

  transform<T extends { attributes?: Record<string, string> }>(entity: T, editorUrl: string): string | undefined {
    const project = this._multipleProjectsService.getProject(entity);
    if (!project) {
      return undefined;
    }
    return this._multipleProjectsService.getUrlForProject(project, { url: editorUrl });
  }
}
