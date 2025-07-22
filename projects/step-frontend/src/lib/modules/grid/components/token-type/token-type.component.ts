import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'step-token-type',
  templateUrl: './token-type.component.html',
  styleUrls: ['./token-type.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class TokenTypeComponent {
  @Input() type!: string;

  static readonly TYPE_LABEL_TRANSLATIONS: { [key: string]: string } = {
    default: 'Java',
    node: 'Node.js',
    dotnet: '.NET',
  };

  readonly typeLabelTranslations = TokenTypeComponent.TYPE_LABEL_TRANSLATIONS;
}
