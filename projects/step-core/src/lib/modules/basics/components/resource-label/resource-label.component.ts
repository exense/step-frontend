import { Component, inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Resource, AugmentedResourcesService } from '../../../../client/step-client-module';
import { of, pipe } from 'rxjs';
import { HttpHeaderResponse, HttpResponse, HttpStatusCode } from '@angular/common/http';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'step-resource-label',
  templateUrl: './resource-label.component.html',
  styleUrls: ['./resource-label.component.scss'],
  standalone: false,
})
export class ResourceLabelComponent implements OnChanges {
  private _api = inject(AugmentedResourcesService);

  @Input() stModel: any;
  @Input() stFormat?: string;
  resourceFilename?: string;
  resourceNotExisting?: boolean;
  absoluteFilepath?: string;
  fileName?: string;

  isResource: boolean = false;

  private getResourceId(stModel: string): string {
    return stModel.replace('resource:', '');
  }

  private getIsResource(stModel?: string): boolean {
    return !!stModel && typeof stModel === 'string' && stModel.indexOf('resource:') == 0;
  }

  ngOnChanges(changes: SimpleChanges): void {
    const cStModel = changes['stModel'];
    if (cStModel?.isFirstChange() || cStModel?.previousValue !== cStModel?.currentValue) {
      const stModel = cStModel?.currentValue;
      const isResource = this.getIsResource(stModel);
      if (isResource) {
        this._api
          .overrideInterceptor(
            pipe(
              catchError((error: HttpHeaderResponse) => {
                if (error.status === HttpStatusCode.NotFound) {
                  const empty = new HttpResponse({ status: HttpStatusCode.NoContent });
                  return of(empty);
                }
                throw error;
              }),
            ),
          )
          .getResource(this.getResourceId(stModel))
          .subscribe((resource?: Resource) => {
            if (resource) {
              this.resourceNotExisting = false;
              this.resourceFilename = resource.resourceName;
            } else {
              this.resourceNotExisting = true;
              this.resourceFilename = undefined;
            }
          });
      } else {
        this.absoluteFilepath = stModel;
        this.fileName = this.absoluteFilepath?.replace(/^.*[\\\/]/, '');
      }

      this.isResource = isResource;
    }
  }
}
