import { Component, OnInit, Output, EventEmitter, Input, OnChanges, SimpleChanges } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { AuthService, AJS_MODULE, KeyValuePair, User, Preferences, AdminService } from '@exense/step-core';

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
  readonly canChangePassword = !!this._authService.getConf()?.passwordManagement;
  readonly canGenerateApiKey = !!this._authService.getConf()?.authentication;

  constructor(private _adminApiService: AdminService, private _authService: AuthService) {}

  @Input() error?: string;
  @Output() errorChange: EventEmitter<string | undefined> = new EventEmitter<string | undefined>();

  user: Partial<User> = {};
  preferences: KeyValuePair<string, string>[] = [];

  @Output() showGenerateApiKeyDialog: EventEmitter<any> = new EventEmitter<any>();

  changePwd(): void {
    this._authService.showPasswordChangeDialog(false);
  }

  invokeShowGenerateApiKeyDialog(): void {
    this.showGenerateApiKeyDialog.emit({});
  }

  addPreference(): void {
    const key = '';
    const value = '';
    this.preferences.push({ key, value });
  }

  savePreferences(): void {
    const preferences = kvPairArrayToPreferences(this.preferences);
    this._adminApiService.putPreferences(preferences).subscribe({
      error: (err) => {
        this.error = 'Unable to save preferences. Please contact your administrator.';
        this.errorChange.emit(this.error);
      },
    });
  }

  ngOnInit(): void {
    this._adminApiService.getMyUser().subscribe((user) => {
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
