import { InjectionToken } from '@angular/core';
import { ImageType } from '../types/image-type.enum';

export const IMAGE_TYPES = new InjectionToken<ReadonlySet<ImageType>>('Available image types', {
  providedIn: 'root',
  factory: () =>
    new Set([
      ImageType.JPG,
      ImageType.JPEG,
      ImageType.PNG,
      ImageType.GIF,
      ImageType.BMP,
      ImageType.WEBP,
      ImageType.TIFF,
      ImageType.TIF,
      ImageType.SVG,
      ImageType.HEIC,
      ImageType.AVIF,
    ]),
});
