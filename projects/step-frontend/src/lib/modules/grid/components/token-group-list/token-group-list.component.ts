import { Component, inject } from '@angular/core';
import {
  GridService,
  STORE_ALL,
  TableFetchLocalDataSource,
  TableIndicatorMode,
  tablePersistenceConfigProvider,
  TokenGroupCapacity,
} from '@exense/step-core';
import { map } from 'rxjs';
import { FlatObjectStringFormatPipe } from '../../pipes/flat-object-format.pipe';

@Component({
  selector: 'step-token-group-list',
  templateUrl: './token-group-list.component.html',
  styleUrls: ['./token-group-list.component.scss'],
  providers: [tablePersistenceConfigProvider('tokenGroupList', STORE_ALL)],
  standalone: false,
})
export class TokenGroupListComponent {
  private _gridService = inject(GridService);

  readonly searchableTokenGroupRequest = new TableFetchLocalDataSource(
    () => this._gridService.getUsageByIdentity(this.getCheckedKeyList()),
    TableFetchLocalDataSource.configBuilder<TokenGroupCapacity>()
      .addSearchStringPredicate('key', (item) => FlatObjectStringFormatPipe.format(item.key!))
      .build(),
  );

  readonly checkedMap: Record<string, boolean | undefined> = { url: true };
  readonly checkedMapKeys$ = this._gridService
    .getTokenAttributeKeys()
    .pipe(map((attributeKeys) => Object.keys(this.checkedMap).concat(attributeKeys)));

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

  protected readonly TableIndicatorMode = TableIndicatorMode;
}
