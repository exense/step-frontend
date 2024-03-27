import { ChangeDetectionStrategy, Component, computed, HostBinding, input, Input } from '@angular/core';

const DELIMITERS = new Set([' ', '_', '-', '.', '+']);
const DEFAULT_BACKGROUND = '#4b5565';

@Component({
  selector: 'step-avatar-circle',
  templateUrl: './avatar-circle.component.html',
  styleUrl: './avatar-circle.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvatarCircleComponent {
  @HostBinding('style.background-color')
  @Input({ transform: (value: string | undefined | null) => value || DEFAULT_BACKGROUND })
  background = DEFAULT_BACKGROUND;

  name = input('', {
    transform: (value: string | undefined | null) => value ?? '',
  });

  protected initials = computed(() => {
    const name = this.name().trim();
    if (!name) {
      return '';
    }

    const words = this.splitStringWithMultipleDelimiters(name);

    if (!words.length) {
      return '';
    }

    if (words.length === 1) {
      return words[0][0].toUpperCase();
    }

    return words[0][0].toUpperCase() + words[words.length - 1][0].toUpperCase();
  });

  private splitStringWithMultipleDelimiters(str: string): string[] {
    const parts = [];
    let buf = '';

    for (let i = 0; i < str.length; i++) {
      if (DELIMITERS.has(str[i])) {
        if (buf) {
          parts.push(buf);
          buf = '';
        }
        continue;
      }
      buf += str[i];
    }
    if (buf) {
      parts.push(buf);
    }
    return parts;
  }
}
