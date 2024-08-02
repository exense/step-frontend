import { Injectable, OnDestroy } from '@angular/core';
import { JsonFieldSchema } from '../../json-forms';

@Injectable({
  providedIn: 'root',
})
export class RepositoryParametersSchemasService implements OnDestroy {
  private data = new Map<string, JsonFieldSchema>();

  ngOnDestroy(): void {
    this.data.clear();
  }

  registerSchema(repositoryId: string, schema: JsonFieldSchema): void {
    this.data.set(repositoryId, schema);
  }

  getSchema(repositoryId: string): JsonFieldSchema | undefined {
    return this.data.get(repositoryId);
  }
}
