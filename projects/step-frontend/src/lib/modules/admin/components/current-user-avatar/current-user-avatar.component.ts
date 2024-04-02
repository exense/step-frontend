import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { map, of, switchMap } from 'rxjs';
import { AuthService, AVATAR_COLOR_PREFERENCE_KEY } from '@exense/step-core';
import { UserStateService } from '../../injectables/user-state.service';
import { ANONYMOUS_COLOR } from '../../types/constants';

@Component({
  selector: 'step-current-user-avatar',
  templateUrl: './current-user-avatar.component.html',
  styleUrl: './current-user-avatar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurrentUserAvatarComponent {
  private _auth = inject(AuthService);
  private _userState = inject(UserStateService);
  private _avatarColorPreferenceKey = inject(AVATAR_COLOR_PREFERENCE_KEY);

  readonly userName$ = this._userState.user$.pipe(map((user) => user.username));

  readonly tooltip$ = this._auth.context$.pipe(
    map((ctx) => {
      if (!ctx) {
        return undefined;
      }
      return `${ctx.userID} [${ctx.role}]`;
    }),
  );

  readonly color$ = this._auth.initialize$.pipe(
    switchMap((user) => {
      if (!this._auth.getConf()?.authentication) {
        return of(ANONYMOUS_COLOR);
      }
      return this._userState.getPreference$(this._avatarColorPreferenceKey);
    }),
  );
}
