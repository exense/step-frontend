import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  HostListener,
  inject,
  Input,
  ViewEncapsulation,
} from '@angular/core';
import { AVATAR_COLOR_PREFERENCE_KEY, ColorFieldBase } from '@exense/step-core';
import { UserStateService } from '../../injectables/user-state.service';

@Component({
  selector: 'step-avatar-editor',
  templateUrl: './avatar-editor.component.html',
  styleUrl: './avatar-editor.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvatarEditorComponent extends ColorFieldBase {
  private _userState = inject(UserStateService);
  private _avatarColorKey = inject(AVATAR_COLOR_PREFERENCE_KEY);

  @HostBinding('class.is-disabled')
  @Input()
  disabled = false;

  getModel(): string | undefined {
    return this._userState.getPreference(this._avatarColorKey);
  }

  setModel(value?: string): void {
    this._userState.changePreference(this._avatarColorKey, value);
  }

  isDisabled(): boolean {
    return this.disabled;
  }

  @HostListener('click')
  private handleClick(): void {
    this.chooseColor();
  }
}
