import { Component } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import {
  AJS_MODULE,
  GridService,
  AugmentedTokenWrapperOwner,
  TableFetchLocalDataSource,
  TokenWrapper,
} from '@exense/step-core';
import { FlatObjectStringFormatPipe } from '../../pipes/flat-object-format.pipe';
import { TokenTypeComponent } from '../token-type/token-type.component';

@Component({
  selector: 'step-token-list',
  templateUrl: './token-list.component.html',
  styleUrls: ['./token-list.component.scss'],
})
export class TokenListComponent {
  readonly searchableToken = new TableFetchLocalDataSource(
    () => this._gridService.getTokenAssociations(),
    TableFetchLocalDataSource.configBuilder<TokenWrapper>()
      .addSearchStringPredicate('id', (item) => item.token!.id!)
      .addSearchStringPredicate('type', (item) => item.token!.attributes!['$agenttype'])
      .addSearchStringPredicate('agent', (item) => item.agent!.agentUrl!)
      .addSearchStringPredicate('attributes', (item) => FlatObjectStringFormatPipe.format(item.token!.attributes!))
      .addSearchStringPredicate('state', (item) => item.state!)
      .addSearchStringPredicate(
        'executionDescription',
        (item) => (item.currentOwner as AugmentedTokenWrapperOwner)?.executionDescription
      )
      .addSortStringPredicate('id', (item) => item.token!.id!)
      .addSortStringPredicate('type', (item) => item.token!.attributes!['$agenttype'])
      .addSortStringPredicate('agent', (item) => item.agent!.agentUrl!)
      .addSortStringPredicate(
        'executionDescription',
        (item) => (item.currentOwner as AugmentedTokenWrapperOwner)?.executionDescription
      )
      .build()
  );

  constructor(private _gridService: GridService) {}

  loadTable(): void {
    this.searchableToken.reload();
  }

  pause(id: string): void {
    this._gridService.startTokenMaintenance(id).subscribe(() => {
      this.loadTable();
    });
  }

  play(id: string): void {
    this._gridService.stopTokenMaintenance(id).subscribe(() => {
      this.loadTable();
    });
  }

  removeTokenErrors(id: string): void {
    this._gridService.removeAgentTokenErrors(id).subscribe(() => {
      this.loadTable();
    });
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepTokenList', downgradeComponent({ component: TokenListComponent }));
