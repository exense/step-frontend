import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { AuthService, AVATAR_COLOR_PREFERENCE_KEY, UsersService } from '@exense/step-core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { map, switchMap } from 'rxjs';
import { ANONYMOUS_COLOR } from '../../types/constants';

@Component({
  selector: 'step-user-avatar',
  templateUrl: './user-avatar.component.html',
  styleUrl: './user-avatar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserAvatarComponent {
  private _auth = inject(AuthService);
  private _users = inject(UsersService);
  private _avatarColorPreferenceKey = inject(AVATAR_COLOR_PREFERENCE_KEY);

  userId = input.required<string>();

  private user$ = toObservable(this.userId).pipe(
    switchMap((userId) => this._users.getUserById(userId)),
    takeUntilDestroyed(),
  );

  protected userName$ = this.user$.pipe(map((user) => user?.username ?? this.userId()));

  protected color$ = this.user$.pipe(
    map((user) => {
      if (!this._auth.getConf()?.authentication) {
        return ANONYMOUS_COLOR;
      }
      return user?.preferences?.preferences?.[this._avatarColorPreferenceKey];
    }),
  );
}
