import { Component } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { AJS_MODULE, GridService, AugmentedTokenWrapperOwner, TableFetchLocalDataSource } from '@exense/step-core';
import { FlatObjectStringFormatPipe } from '../../pipes/flat-object-format.pipe';
import { TokenTypeComponent } from '../token-type/token-type.component';

@Component({
  selector: 'step-token-list',
  templateUrl: './token-list.component.html',
  styleUrls: ['./token-list.component.scss'],
})
export class TokenListComponent {
  readonly searchableToken = new TableFetchLocalDataSource(() => this._gridService.getTokenAssociations(), {
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
