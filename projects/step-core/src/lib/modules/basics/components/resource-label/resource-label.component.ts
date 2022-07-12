import { Component, Inject, Input, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { AJS_ROOT_SCOPE } from '../../../../shared';
import { IRootScopeService } from 'angular';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'step-resource-label',
  templateUrl: './resource-label.component.html',
  styleUrls: ['./resource-label.component.scss'],
})
export class ResourceLabelComponent {
  @Input() stModel: any;
  @Input() stFormat?: string;
  resourceFilename?: string;
  resourceNotExisting?: boolean;
  absoluteFilepath?: string;
  fileName?: string;

  constructor(private _httpClient: HttpClient, @Inject(AJS_ROOT_SCOPE) private _$rootScope: IRootScopeService) {}

  ngOnChanges(changes: SimpleChanges): void {
    console.log('stModel', this.stModel);
    if (changes['stModel'].isFirstChange() || changes['stModel'].previousValue !== changes['stModel'].currentValue) {
      if (this.isResource()) {
        this._httpClient.get<any>(`rest/resources/${this.getResourceId()}`).subscribe((resource: any) => {
          if (resource) {
            this.resourceNotExisting = false;
            this.resourceFilename = resource.resourceName;
          } else {
            this.resourceNotExisting = true;
          }
        });
      } else {
        this.absoluteFilepath = this.stModel;
        this.fileName = this.absoluteFilepath!.replace(/^.*[\\\/]/, '');
      }
    }
  }

  isResource() {
    return this.stModel && typeof this.stModel == 'string' && this.stModel.indexOf('resource:') == 0;
  }

  getResourceId() {
    return this.stModel.replace('resource:', '');
  }
}
