import { Component, inject } from '@angular/core';
import {
  GridService,
  AugmentedTokenWrapperOwner,
  TableFetchLocalDataSource,
  TokenWrapper,
  tablePersistenceConfigProvider,
  STORE_ALL,
  TableIndicatorMode,
} from '@exense/step-core';
import { FlatObjectStringFormatPipe } from '../../pipes/flat-object-format.pipe';

@Component({
  selector: 'step-token-list',
  templateUrl: './token-list.component.html',
  styleUrls: ['./token-list.component.scss'],
  providers: [tablePersistenceConfigProvider('tokenList', STORE_ALL)],
  standalone: false,
})
export class TokenListComponent {
  private _gridService = inject(GridService);

  readonly searchableToken = new TableFetchLocalDataSource(
    () => this._gridService.getTokenAssociations(),
    TableFetchLocalDataSource.configBuilder<TokenWrapper>()
      .addSearchStringPredicate('id', (item) => item.token!.id!)
      .addSearchStringPredicate('type', (item) => item.token!.attributes!['$agenttype'])
      .addSearchStringPredicate('agent', (item) => item.agent!.agentUrl!)
      .addSearchStringPredicate('attributes', (item) => FlatObjectStringFormatPipe.format(item.token!.attributes!))
      .addSearchStringRegexPredicate('state', (item) => item.state!)
      .addSearchStringPredicate(
        'executionDescription',
        (item) => (item.currentOwner as AugmentedTokenWrapperOwner)?.executionDescription,
      )
      .addSortStringPredicate('id', (item) => item.token!.id!)
      .addSortStringPredicate('type', (item) => item.token!.attributes!['$agenttype'])
      .addSortStringPredicate('agent', (item) => item.agent!.agentUrl!)
      .addSortStringPredicate(
        'executionDescription',
        (item) => (item.currentOwner as AugmentedTokenWrapperOwner)?.executionDescription,
      )
      .build(),
  );

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

  protected readonly TableIndicatorMode = TableIndicatorMode;
}
