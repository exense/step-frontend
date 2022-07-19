import { Component, OnDestroy } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { AJS_MODULE, Mutable, GridService, TokenGroupCapacity, TableLocalDataSource } from '@exense/step-core';
import { Observable, BehaviorSubject, switchMap, shareReplay, tap } from 'rxjs';
import { FlatObjectStringFormatPipe } from '../../pipes/flat-object-format.pipe';

type InProgress = Mutable<Pick<TokenGroupListComponent, 'inProgress'>>;

@Component({
  selector: 'step-token-group-list',
  templateUrl: './token-group-list.component.html',
  styleUrls: ['./token-group-list.component.scss'],
})
export class TokenGroupListComponent implements OnDestroy {
  readonly inProgress: boolean = false;

  private tokenGroupRequestSubject$ = new BehaviorSubject<any>({});
  private tokenGroupRequest$: Observable<TokenGroupCapacity[]> = this.tokenGroupRequestSubject$.pipe(
    tap((_) => ((this as InProgress).inProgress = true)),
    switchMap((_) => this._gridService.getUsageByIdentity(this.getCheckedKeyList())),
    tap((_) => ((this as InProgress).inProgress = false)),
    shareReplay(1)
  );

  readonly searchableTokenGroupRequest$ = new TableLocalDataSource(this.tokenGroupRequest$, {
    searchPredicates: {
      key: (element, searchValue) =>
        FlatObjectStringFormatPipe.format(element.key!).toLowerCase().includes(searchValue.toLowerCase()),
    },
  });

  readonly checkedMap: { [key: string]: boolean } = {
    url: true,
    tech: false,
    $agentid: false,
    $agenttype: false,
    $tokenid: false,
    type: false,
  };
  readonly checkedMapKeys = Object.keys(this.checkedMap);

  constructor(private _gridService: GridService) {}

  public toggleCheckBox(key: string): void {
    this.checkedMap[key] = !this.checkedMap[key];
    this.loadTable();
  }

  private getCheckedKeyList(): string[] {
    const checkedKeyList = [];
    for (let key of Object.keys(this.checkedMap)) {
      if (this.checkedMap[key]) {
        checkedKeyList.push(key);
      }
    }
    return checkedKeyList;
  }

  public loadTable(): void {
    this.tokenGroupRequestSubject$.next({});
  }

  public ngOnDestroy(): void {
    this.tokenGroupRequestSubject$.complete();
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepTokenGroupList', downgradeComponent({ component: TokenGroupListComponent }));
