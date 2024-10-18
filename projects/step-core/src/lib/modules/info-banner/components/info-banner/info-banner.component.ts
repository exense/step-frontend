import { Component, computed, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AlertType, StepBasicsModule } from '../../../basics/step-basics.module';
import { InfoBannerService } from '../../injectables/info-banner.service';
import { KeyValue } from '@angular/common';
import { AuthService } from '../../../auth/injectables/auth.service';

@Component({
  selector: 'step-info-banner',
  templateUrl: './info-banner.component.html',
  styleUrl: './info-banner.component.scss',
  imports: [StepBasicsModule],
  standalone: true,
})
export class InfoBannerComponent {
  private _auth = inject(AuthService);
  private _infoBannerService = inject(InfoBannerService);
  private _domSanitizer = inject(DomSanitizer);

  protected readonly AlertType = AlertType;
  protected readonly infos = computed(() => {
    const infos = this._infoBannerService.actualInfos();
    return infos
      .filter(
        (info) =>
          (!info.options?.hasPermission || this._auth.hasRight(info.options?.hasPermission)) &&
          (!info.options?.hasNotPermission || !this._auth.hasRight(info.options?.hasNotPermission)),
      )
      .map(({ id, info }) => {
        const value = this._domSanitizer.bypassSecurityTrustHtml(info);
        return { key: id, value } as KeyValue<string, SafeHtml>;
      });
  });

  closeBanner(id: string): void {
    this._infoBannerService.hideInfoInActualView(id);
  }
}
