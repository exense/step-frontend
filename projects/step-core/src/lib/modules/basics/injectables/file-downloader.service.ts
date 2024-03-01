import { inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class FileDownloaderService {
  private _doc = inject(DOCUMENT);

  download(url: string, fileName: string) {
    const linkContainer: { link?: HTMLAnchorElement } = {};
    linkContainer.link = this._doc.createElement('a');
    linkContainer.link.href = url;
    linkContainer.link.download = fileName;
    this._doc.body.appendChild(linkContainer.link);
    linkContainer.link.click();
    this._doc.body.removeChild(linkContainer.link);
    delete linkContainer.link;
  }
}
