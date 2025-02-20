import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export abstract class SourceEditorAutocompleteService {
  abstract autocomplete(type: string): Observable<string[]>;
}
