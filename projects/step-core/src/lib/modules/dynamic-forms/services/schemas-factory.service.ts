import { inject, Injectable } from '@angular/core';
import { ScreensService } from '../../../client/step-client-module';
import { map, Observable } from 'rxjs';
import { JsonFieldsSchema } from '../../json-forms';

@Injectable({
  providedIn: 'root',
})
export class SchemasFactoryService {
  private _screenApi = inject(ScreensService);

  buildAttributesSchemaForScreen(screenId: string): Observable<JsonFieldsSchema> {
    return this._screenApi.getInputsForScreenPost(screenId).pipe(
      map((inputs) =>
        inputs
          .filter((input) => input.id?.startsWith('attributes.'))
          .reduce(
            (res, input) => {
              const name = input.id!.replace('attributes.', '');
              switch (input.type) {
                case 'CHECKBOX':
                  res.properties[name] = { type: 'boolean' };
                  break;
                case 'DROPDOWN':
                  res.properties[name] = {
                    enum: input.options!.map((opt) => opt.value!),
                  };
                  break;
                default:
                  res.properties[name] = { type: 'string' };
                  break;
              }
              return res;
            },
            { properties: {} } as JsonFieldsSchema,
          ),
      ),
    );
  }
}
