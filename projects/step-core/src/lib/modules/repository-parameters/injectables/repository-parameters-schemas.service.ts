import { Injectable, OnDestroy } from '@angular/core';
import { JsonFieldsSchema } from '../../json-forms';

@Injectable({
  providedIn: 'root',
})
export class RepositoryParametersSchemasService implements OnDestroy {
  private data = new Map<string, JsonFieldsSchema>();

  ngOnDestroy(): void {
    this.data.clear();
  }

  registerSchema(repositoryId: string, schema: JsonFieldsSchema): void {
    this.data.set(repositoryId, schema);
  }

  getSchema(repositoryId: string): JsonFieldsSchema | undefined {
    return this.data.get(repositoryId);
  }
}
