import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ArtefactInfo, AuthService, ControllerService, RepositoryObjectReference } from '@exense/step-core';
import { ActivatedRoute } from '@angular/router';
import { IncludeTestcases } from '../../shared/include-testcases.interface';

@Component({
  selector: 'step-repository',
  templateUrl: './repository.component.html',
  styleUrls: ['./repository.component.scss'],
  host: {
    class: 'container',
  },
})
export class RepositoryComponent implements OnInit {
  private _auth = inject(AuthService);
  private _controllersApi = inject(ControllerService);
  private _activatedRoute = inject(ActivatedRoute);
  private _cd = inject(ChangeDetectorRef);

  protected includedTestcases?: IncludeTestcases;

  protected loading: boolean = false;
  protected isolateExecution: boolean = false;

  protected repoRef?: RepositoryObjectReference;

  protected artefact?: ArtefactInfo;

  protected error?: Error;

  ngOnInit(): void {
    this.setupLocationParams();
    this.loadArtefact();
  }

  handleIncludedTestCasesChange(includedTestcases: IncludeTestcases): void {
    this.includedTestcases = includedTestcases;
    this._cd.detectChanges();
  }

  private setupLocationParams(): void {
    const search = this._activatedRoute.snapshot.queryParams;
    this.isolateExecution = !!search['isolate'];

    if (search['user']) {
      this._auth.updateContext({ userID: search['user'] });
    }

    if (search['repositoryId']) {
      this.repoRef = {
        repositoryID: search['repositoryId'],
        repositoryParameters: Object.entries(search).reduce((result, [key, value]) => {
          if (!['repositoryId', 'tenant'].includes(key)) {
            result[key] = value as string;
          }
          return result;
        }, {} as Record<string, string>),
      };
    }
  }

  private loadArtefact(): void {
    this.loading = true;
    this._controllersApi.getArtefactInfo(this.repoRef).subscribe({
      next: (artefact) => (this.artefact = artefact),
      error: (error) => (this.error = error),
      complete: () => (this.loading = false),
    });
  }
}
