import { Injectable, signal } from '@angular/core';
import { RepositoryObjectReference } from '@exense/step-core';

@Injectable()
export class RepoRefHolderService {
  readonly repoRef = signal<RepositoryObjectReference | undefined>(undefined);
}
