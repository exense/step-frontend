import { Component, OnDestroy } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import {
  AJS_MODULE,
  Mutable,
  TableLocalDataSource,
  GridService,
  TokenWrapper,
  AugmentedTokenWrapperOwner,
} from '@exense/step-core';
import { Observable, BehaviorSubject, switchMap, shareReplay, tap } from 'rxjs';
import { FlatObjectStringFormatPipe } from '../../pipes/flat-object-format.pipe';
import { TokenTypeComponent } from '../token-type/token-type.component';

type InProgress = Mutable<Pick<TokenListComponent, 'inProgress'>>;

@Component({
  selector: 'step-token-list',
  templateUrl: './token-list.component.html',
  styleUrls: ['./token-list.component.scss'],
})
export class TokenListComponent implements OnDestroy {
  readonly inProgress: boolean = false;

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
        TokenTypeComponent.TYPE_LABEL_TRANSLATIONS[element.token!.attributes!['$agenttype']]!.toLowerCase().includes(
          searchValue.toLowerCase()
        ),
      agent: (element, searchValue) => element.agent!.agentUrl!.toLowerCase().includes(searchValue.toLowerCase()),
      attributes: (element, searchValue) =>
        FlatObjectStringFormatPipe.format(element.token!.attributes!).includes(searchValue.toLowerCase()),
      state: (element, searchValue) => searchValue.toUpperCase().includes(element.state!.toUpperCase()),
      executionDescription: (element, searchValue) =>
        (element.currentOwner as AugmentedTokenWrapperOwner)?.executionDescription.includes(searchValue.toLowerCase()),
    },
    sortPredicates: {
      id: (elementA, elementB) => elementA.token!.id!.localeCompare(elementB.token!.id!),
      type: (elementA, elementB) =>
        TokenTypeComponent.TYPE_LABEL_TRANSLATIONS[elementA.token!.attributes!['$agenttype']]!.localeCompare(
          TokenTypeComponent.TYPE_LABEL_TRANSLATIONS[elementB.token!.attributes!['$agenttype']]!
        ),
      agent: (elementA, elementB) => elementA.agent!.agentUrl!.localeCompare(elementB.agent!.agentUrl!),
      executionDescription: (elementA, elementB) =>
        (elementA.currentOwner as AugmentedTokenWrapperOwner)?.executionDescription.localeCompare(
          (elementB.currentOwner as AugmentedTokenWrapperOwner)?.executionDescription
        ),
    },
  });

  constructor(private _gridService: GridService) {}

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
