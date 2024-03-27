import { inject, Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, map, Observable, shareReplay, switchMap, tap, combineLatest } from 'rxjs';
import { KeyValue } from '@angular/common';
import { AuthService, Preferences, User, UserService } from '@exense/step-core';

type PreferenceItem = KeyValue<string, string>;

const preferencesToKVPairArray = (preferences?: Preferences) =>
  Object.entries(preferences?.preferences || {}).reduce(
    (result, [key, value]) => [...result, { key, value: value ?? '' }],
    [] as PreferenceItem[],
  );

const kvPairArrayToPreferences = (values?: PreferenceItem[]): Preferences => {
  const preferences = (values || []).reduce(
    (res, { key, value }) => {
      res[key] = value;
      return res;
    },
    {} as Record<string, string>,
  );
  return { preferences };
};

@Injectable()
export class UserStateService implements OnDestroy {
  private _auth = inject(AuthService);
  private _userApi = inject(UserService);

  private preferencesInternal$ = new BehaviorSubject<PreferenceItem[]>([]);

  readonly user$ = this._auth.initialize$.pipe(
    switchMap(() => this._userApi.getMyUser()),
    map((user) => (user ?? {}) as Partial<User>),
    shareReplay(1),
  );

  private preferencesRemote$ = this.user$.pipe(
    map((user) => preferencesToKVPairArray(user?.preferences)),
    tap((preferences) => this.preferencesInternal$.next(preferences)),
    shareReplay(1),
  );

  readonly preferences$ = combineLatest([this.preferencesRemote$, this.preferencesInternal$]).pipe(
    map(([_, prefs]) => prefs),
  );

  ngOnDestroy(): void {
    this.preferencesInternal$.complete();
  }

  addPreference(): void {
    const preferences = this.preferencesInternal$.value;
    this.preferencesInternal$.next([...preferences, { key: '', value: '' }]);
  }

  removePreference(item: PreferenceItem): void {
    const preferences = this.preferencesInternal$.value.filter((pref) =>
      !pref.key ? pref !== item : pref.key !== item.key,
    );
    this.savePreferences(preferences);
  }

  changePreference(key: string, value?: string): void {
    if (!value) {
      this.removePreference({ key, value: '' });
      return;
    }
    const preferences = this.preferencesInternal$.value;
    const prefItem = preferences.find((item) => item.key === key);
    if (prefItem) {
      prefItem.value = value;
    } else {
      preferences.push({ key, value });
    }
    this.savePreferences(preferences);
  }

  getPreference$(key: string): Observable<string | undefined> {
    return this.preferences$.pipe(
      map((preferences) => {
        const prefItem = preferences.find((item) => item.key === key);
        return prefItem?.value;
      }),
    );
  }

  getPreference(key: string): string | undefined {
    const preferences = this.preferencesInternal$.value;
    const prefItem = preferences?.find((item) => item.key === key);
    return prefItem?.value;
  }

  savePreferences(preferences?: PreferenceItem[]): void {
    preferences = preferences ?? this.preferencesInternal$.value;
    this._userApi
      .putPreferences(kvPairArrayToPreferences(preferences))
      .subscribe(() => this.preferencesInternal$.next(preferences!));
  }
}
