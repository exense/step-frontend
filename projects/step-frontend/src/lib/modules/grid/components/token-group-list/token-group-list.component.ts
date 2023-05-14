import { Component } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import {
  AJS_MODULE,
  GridService,
  STORE_ALL,
  TableFetchLocalDataSource,
  tablePersistenceConfigProvider,
  TokenGroupCapacity,
} from '@exense/step-core';
import { FlatObjectStringFormatPipe } from '../../pipes/flat-object-format.pipe';

@Component({
  selector: 'step-token-group-list',
  templateUrl: './token-group-list.component.html',
  styleUrls: ['./token-group-list.component.scss'],
  providers: [tablePersistenceConfigProvider('tokenGroupList', STORE_ALL)],
})
export class TokenGroupListComponent {
  readonly searchableTokenGroupRequest = new TableFetchLocalDataSource(
    () => this._gridService.getUsageByIdentity(this.getCheckedKeyList()),
    TableFetchLocalDataSource.configBuilder<TokenGroupCapacity>()
      .addSearchStringPredicate('key', (item) => FlatObjectStringFormatPipe.format(item.key!))
      .build()
  );

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

  toggleCheckBox(key: string): void {
    this.checkedMap[key] = !this.checkedMap[key];
    this.loadTable();
  }

  loadTable(): void {
    this.searchableTokenGroupRequest.reload();
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
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepTokenGroupList', downgradeComponent({ component: TokenGroupListComponent }));
