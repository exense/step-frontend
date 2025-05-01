import { InjectionToken } from '@angular/core';
import { VideoType } from '../types/video-type.enum';

export const VIDEO_TYPES = new InjectionToken<ReadonlySet<VideoType>>('Available video types', {
  providedIn: 'root',
  factory: () =>
    new Set([
      VideoType.MP4,
      VideoType.MKV,
      VideoType.MOV,
      VideoType.AVI,
      VideoType.WMV,
      VideoType.FLV,
      VideoType.WEBM,
      VideoType.MPEG,
      VideoType.MPG,
      VideoType.M4V,
      VideoType._3PG,
      VideoType._3G2,
      VideoType.OGV,
    ]),
});
