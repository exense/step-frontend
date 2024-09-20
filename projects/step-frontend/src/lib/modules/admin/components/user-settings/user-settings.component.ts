import { KeyValue } from '@angular/common';
import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import {
  AuthService,
  CredentialsService,
  DialogsService,
  GenerateApiKeyService,
  Preferences,
  TableFetchLocalDataSource,
  User,
  UserService,
} from '@exense/step-core';
import { BehaviorSubject, filter, of, pipe, switchMap, tap } from 'rxjs';

const preferencesToKVPairArray = (preferences?: Preferences): KeyValue<string, string>[] => {
  const prefsObject = preferences?.preferences || {};
  const result = Object.keys(prefsObject).reduce(
    (result, key) => {
      const value = prefsObject[key] || '';
      return [...result, { key, value }];
    },
    [] as KeyValue<string, string>[],
  );
  return result;
};

const kvPairArrayToPreferences = (values?: KeyValue<string, string>[]): Preferences => {
  const preferences = (values || []).reduce(
    (res, { key, value }) => {
      res[key] = value;
      return res;
    },
    {} as { [key: string]: string },
  );
  return { preferences };
};

@Component({
  selector: 'step-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class UserSettingsComponent implements OnInit, OnChanges, OnDestroy {
  private _userApi = inject(UserService);
  private _authService = inject(AuthService);
  private _credentialsService = inject(CredentialsService);
  private _generateApiKey = inject(GenerateApiKeyService);
  private _dialogs = inject(DialogsService);

  readonly canChangePassword = !!this._authService.getConf()?.passwordManagement;
  readonly canGenerateApiKey = !!this._authService.getConf()?.authentication;
  readonly preferences$ = new BehaviorSubject<KeyValue<string, string>[]>([]);

  @Input() error?: string;
  @Output() errorChange: EventEmitter<string | undefined> = new EventEmitter<string | undefined>();

  user: Partial<User> = {};
  preferences: KeyValue<string, string>[] = [];

  readonly tokensSource = new TableFetchLocalDataSource(() => {
    if (!this.canGenerateApiKey) {
      return of([]);
    }
    return this._generateApiKey.getServiceAccountTokens();
  });

  private reloadTokens = pipe(tap((result) => this.tokensSource.reload()));

  ngOnInit(): void {
    this._userApi.getMyUser().subscribe((user) => {
      this.user = user || {};
      this.preferences$.next(preferencesToKVPairArray(this.user?.preferences));
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    const errorChange = changes['error'];
    if (errorChange?.currentValue !== errorChange?.previousValue) {
      this.errorChange.emit(errorChange?.currentValue);
    }
  }

  ngOnDestroy(): void {
    this.preferences$.complete();
  }

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

  addPreference(): void {
    const key = '';
    const value = '';
    const preferences = [...this.preferences$.value, { key, value }];
    this.preferences$.next(preferences);
  }

  removePreference(itemToRemove: KeyValue<string, string>): void {
    const preferences = this.preferences$.value.filter((item) => item !== itemToRemove);
    this.preferences$.next(preferences);
    this.savePreferences();
  }

  savePreferences(): void {
    const preferences = kvPairArrayToPreferences(this.preferences$.value);
    this._userApi.putPreferences(preferences).subscribe({
      error: (err) => {
        this.error = 'Unable to save preferences. Please contact your administrator.';
        this.errorChange.emit(this.error);
      },
    });
  }
}
