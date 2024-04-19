import { Component, inject, ViewEncapsulation } from '@angular/core';
import {
  AuthService,
  CredentialsService,
  DialogsService,
  GenerateApiKeyService,
  TableFetchLocalDataSource,
} from '@exense/step-core';
import { filter, of, pipe, switchMap, tap } from 'rxjs';
import { UserStateService } from '../../injectables/user-state.service';

@Component({
  selector: 'step-my-account',
  templateUrl: './my-account.component.html',
  styleUrls: ['./my-account.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class MyAccountComponent {
  private _authService = inject(AuthService);
  private _credentialsService = inject(CredentialsService);
  private _generateApiKey = inject(GenerateApiKeyService);
  private _dialogs = inject(DialogsService);
  readonly _userState = inject(UserStateService);

  readonly canChangePassword = !!this._authService.getConf()?.passwordManagement;
  readonly canEdit = !!this._authService.getConf()?.authentication;

  readonly tokensSource = new TableFetchLocalDataSource(() => {
    if (!this.canEdit) {
      return of([]);
    }
    return this._generateApiKey.getServiceAccountTokens();
  });

  private reloadTokens = pipe(tap((result) => this.tokensSource.reload()));

  changePwd(): void {
    this._credentialsService.changePassword(false);
  }

  invokeShowGenerateApiKeyDialog(): void {
    this._generateApiKey.showGenerateApiKeyDialog().pipe(this.reloadTokens).subscribe();
  }

  revokeAPIToken(id: string) {
    this._dialogs
      .showWarning('Revoking will make the API key permanently unusable. Do you want to proceed?')
      .pipe(
        filter((isConfirmed) => !!isConfirmed),
        switchMap(() => this._generateApiKey.revoke(id)),
        this.reloadTokens,
      )
      .subscribe();
  }
}
