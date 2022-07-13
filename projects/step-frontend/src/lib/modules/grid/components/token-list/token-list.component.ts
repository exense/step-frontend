import { Component, OnDestroy } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import {
  AJS_MODULE,
  ContextService,
  Mutable,
  TableLocalDataSource,
  GridService,
  TokenWrapper,
} from '@exense/step-core';
import {
  Observable,
  BehaviorSubject,
  switchMap,
  of,
  catchError,
  noop,
  shareReplay,
  tap,
  map,
  lastValueFrom,
} from 'rxjs';
import { FlatObjectFormatService } from '../../services/flat-object-format.service';

type InProgress = Mutable<Pick<TokenListComponent, 'inProgress'>>;

@Component({
  selector: 'step-token-list',
  templateUrl: './token-list.component.html',
  styleUrls: ['./token-list.component.scss'],
})
export class TokenListComponent implements OnDestroy {
  readonly TYPE_LABEL_TRANSLATIONS: { [key: string]: string } = {
    default: 'Java',
    node: 'Node.js',
    dotnet: '.NET',
  };

  readonly inProgress: boolean = false;

  readonly json = JSON;

  private tokenRequestSubject$ = new BehaviorSubject<any>({});
  readonly tokenRequest$: Observable<TokenWrapper[]> = this.tokenRequestSubject$.pipe(
    tap((_) => ((this as InProgress).inProgress = true)),
    switchMap((_) => this._gridService.getTokenAssociations()),
    tap((_) => ((this as InProgress).inProgress = false)),
    shareReplay(1)
  );

  readonly searchableToken$ = new TableLocalDataSource(this.tokenRequest$, {
    searchPredicates: {
      id: (element, searchValue) => element.token!.id!.toLowerCase().includes(searchValue.toLowerCase()),
      type: (element, searchValue) =>
        this.TYPE_LABEL_TRANSLATIONS[element.token!.attributes!['$agenttype']]!.toLowerCase().includes(
          searchValue.toLowerCase()
        ),
      agent: (element, searchValue) => element.agent!.agentUrl!.toLowerCase().includes(searchValue.toLowerCase()),
      attributes: (element, searchValue) =>
        this._flatObjectFormatService.format(element.token!.attributes!).includes(searchValue.toLowerCase()),
      state: (element, searchValue) => searchValue.toUpperCase().includes(element.state!.toUpperCase()),
      // prettier-ignore
      //@ts-ignore
      executionDescription: (element, searchValue) => element.currentOwner?.executionDescription.includes(searchValue.toLowerCase()),
    },
    sortPredicates: {
      id: (elementA, elementB) => elementA.token!.id!.localeCompare(elementB.token!.id!),
      type: (elementA, elementB) =>
        this.TYPE_LABEL_TRANSLATIONS[elementA.token!.attributes!['$agenttype']]!.localeCompare(
          this.TYPE_LABEL_TRANSLATIONS[elementB.token!.attributes!['$agenttype']]!
        ),
      agent: (elementA, elementB) => elementA.agent!.agentUrl!.localeCompare(elementB.agent!.agentUrl!),
      // prettier-ignore
      //@ts-ignore
      executionDescription: (elementA, elementB) => elementA.currentOwner?.executionDescription.localeCompare(elementB.currentOwner?.executionDescription),
    },
  });

  constructor(private _gridService: GridService, public _flatObjectFormatService: FlatObjectFormatService) {}

  public loadTable(): void {
    this.tokenRequestSubject$.next({});
  }

  public pause(id: string): void {
    this._gridService.startTokenMaintenance(id).subscribe(() => {
      this.loadTable();
    });
  }

  public play(id: string): void {
    this._gridService.stopTokenMaintenance(id).subscribe(() => {
      this.loadTable();
    });
  }

  public removeTokenErrors(id: string): void {
    this._gridService.removeTokenError(id).subscribe(() => {
      this.loadTable();
    });
  }

  public ngOnDestroy(): void {
    this.tokenRequestSubject$.complete();
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepTokenList', downgradeComponent({ component: TokenListComponent }));
