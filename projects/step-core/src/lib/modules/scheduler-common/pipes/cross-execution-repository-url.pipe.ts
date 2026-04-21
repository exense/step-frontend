import { inject, Pipe, PipeTransform } from '@angular/core';
import { CommonEntitiesUrlsService } from '@exense/step-core';

@Pipe({
  name: 'crossExecutionRepositoryUrl',
  standalone: true,
})
export class CrossExecutionRepositoryUrlPipe implements PipeTransform {
  private _commonEntitiesUrls = inject(CommonEntitiesUrlsService);
  transform(executionId: string): string {
    return this._commonEntitiesUrls.crossExecutionRepositoryPageUrl(executionId);
  }
}
