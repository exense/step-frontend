import { Component, OnInit, Output, EventEmitter, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import {
  AuthService,
  AJS_MODULE,
  KeyValuePair,
  User,
  Preferences,
  UserService,
  CredentialsService,
  GenerateApiKeyService,
} from '@exense/step-core';

const preferencesToKVPairArray = (preferences?: Preferences): KeyValuePair<string, string>[] => {
  const prefsObject = preferences?.preferences || {};
  const result = Object.keys(prefsObject).reduce((result, key) => {
    const value = prefsObject[key] || '';
    return [...result, { key, value }];
  }, [] as KeyValuePair<string, string>[]);
  return result;
};

const kvPairArrayToPreferences = (values?: KeyValuePair<string, string>[]): Preferences => {
  const preferences = (values || []).reduce((res, { key, value }) => {
    res[key] = value;
    return res;
  }, {} as { [key: string]: string });
  return { preferences };
};

@Component({
  selector: 'step-my-account',
  templateUrl: './my-account.component.html',
  styleUrls: ['./my-account.component.scss'],
})
export class MyAccountComponent implements OnInit, OnChanges {
  private _userApi = inject(UserService);
  private _authService = inject(AuthService);
  private _credentialsService = inject(CredentialsService);
  private _generateApiKey = inject(GenerateApiKeyService);

  readonly canChangePassword = !!this._authService.getConf()?.passwordManagement;
  readonly canGenerateApiKey = !!this._authService.getConf()?.authentication;

  @Input() error?: string;
  @Output() errorChange: EventEmitter<string | undefined> = new EventEmitter<string | undefined>();

  user: Partial<User> = {};
  preferences: KeyValuePair<string, string>[] = [];

  changePwd(): void {
    this._credentialsService.changePassword(false);
  }

  invokeShowGenerateApiKeyDialog(): void {
    this._generateApiKey.showGenerateApiKeyDialog();
  }

  addPreference(): void {
    const key = '';
    const value = '';
    this.preferences.push({ key, value });
  }

  savePreferences(): void {
    const preferences = kvPairArrayToPreferences(this.preferences);
    this._userApi.putPreferences(preferences).subscribe({
      error: (err) => {
        this.error = 'Unable to save preferences. Please contact your administrator.';
        this.errorChange.emit(this.error);
      },
    });
  }

  ngOnInit(): void {
    this._userApi.getMyUser().subscribe((user) => {
      this.user = user || {};
      this.preferences = preferencesToKVPairArray(this.user?.preferences);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    const errorChange = changes['error'];
    if (errorChange?.currentValue !== errorChange?.previousValue) {
      this.errorChange.emit(errorChange?.currentValue);
    }
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepMyAccount', downgradeComponent({ component: MyAccountComponent }));
