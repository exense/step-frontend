import { TypeInfo, TypeInfoCategory } from '../types/type-info';

const createTypeInfo = (
  category: TypeInfoCategory,
  extension?: string,
  mimeType?: string,
  isCustom?: boolean,
): TypeInfo =>
  Object.freeze({
    category,
    extension,
    mimeType,
    isCustom,
  });

export const FILE_TYPES = {
  // Text types
  TXT: createTypeInfo(TypeInfoCategory.TEXT, 'txt', 'text/plain'),
  LOG: createTypeInfo(TypeInfoCategory.TEXT, 'log', 'text/plain'),
  MD: createTypeInfo(TypeInfoCategory.TEXT, 'md', 'text/plain'),
  CSV: createTypeInfo(TypeInfoCategory.TEXT, 'csv', 'text/csv'),
  JSON: createTypeInfo(TypeInfoCategory.TEXT, 'json', 'application/json'),
  XML: createTypeInfo(TypeInfoCategory.TEXT, 'XML', 'application/xml'),
  YAML: createTypeInfo(TypeInfoCategory.TEXT, 'yaml', 'application/yaml'),
  YML: createTypeInfo(TypeInfoCategory.TEXT, 'yml', 'application/yaml'),
  INI: createTypeInfo(TypeInfoCategory.TEXT, 'ini', 'text/plain'),
  CONF: createTypeInfo(TypeInfoCategory.TEXT, 'conf', 'text/plain'),
  JAVA: createTypeInfo(TypeInfoCategory.TEXT, 'java', 'text/plain'),
  C: createTypeInfo(TypeInfoCategory.TEXT, 'c', 'text/plain'),
  CPP: createTypeInfo(TypeInfoCategory.TEXT, 'cpp', 'text/plain'),
  H: createTypeInfo(TypeInfoCategory.TEXT, 'h', 'text/plain'),
  HPP: createTypeInfo(TypeInfoCategory.TEXT, 'hpp', 'text/plain'),
  SH: createTypeInfo(TypeInfoCategory.TEXT, 'sh', 'text/plain'),
  BAT: createTypeInfo(TypeInfoCategory.TEXT, 'bat', 'text/plain'),
  PS1: createTypeInfo(TypeInfoCategory.TEXT, 'ps1', 'text/plain'),
  SQL: createTypeInfo(TypeInfoCategory.TEXT, 'sql', 'text/plain'),
  PHP: createTypeInfo(TypeInfoCategory.TEXT, 'php', 'text/plain'),
  RB: createTypeInfo(TypeInfoCategory.TEXT, 'rb', 'text/plain'),
  PL: createTypeInfo(TypeInfoCategory.TEXT, 'pl', 'text/plain'),
  GO: createTypeInfo(TypeInfoCategory.TEXT, 'go', 'text/plain'),
  RS: createTypeInfo(TypeInfoCategory.TEXT, 'rs', 'text/plain'),

  // Image types
  JPG: createTypeInfo(TypeInfoCategory.IMAGE, 'jpg', 'image/jpeg'),
  JPEG: createTypeInfo(TypeInfoCategory.IMAGE, 'jpeg', 'image/jpeg'),
  PNG: createTypeInfo(TypeInfoCategory.IMAGE, 'png', 'image/png'),
  GIF: createTypeInfo(TypeInfoCategory.IMAGE, 'gif', 'image/gif'),
  BMP: createTypeInfo(TypeInfoCategory.IMAGE, 'bmp', 'image/bmp'),
  WEBP: createTypeInfo(TypeInfoCategory.IMAGE, 'webp', 'image/webp'),
  TIFF: createTypeInfo(TypeInfoCategory.IMAGE, 'tiff', 'image/tiff'),
  TIF: createTypeInfo(TypeInfoCategory.IMAGE, 'tif', 'image/tiff'),
  SVG: createTypeInfo(TypeInfoCategory.IMAGE, 'svg', 'image/svg+xml'),
  HEIC: createTypeInfo(TypeInfoCategory.IMAGE, 'heic', 'image/heic'),
  AVIF: createTypeInfo(TypeInfoCategory.IMAGE, 'avif', 'image/avif'),

  // Video types
  MP4: createTypeInfo(TypeInfoCategory.VIDEO, 'mp4', 'video/mp4'),
  MKV: createTypeInfo(TypeInfoCategory.VIDEO, 'mkv', 'video/x-matroska'),
  MOV: createTypeInfo(TypeInfoCategory.VIDEO, 'mov', 'video/quicktime'),
  AVI: createTypeInfo(TypeInfoCategory.VIDEO, 'avi', 'video/x-msvideo'),
  WMV: createTypeInfo(TypeInfoCategory.VIDEO, 'wmv', 'video/x-ms-vwm'),
  FLW: createTypeInfo(TypeInfoCategory.VIDEO, 'flw', 'video/x-flv'),
  WEBM: createTypeInfo(TypeInfoCategory.VIDEO, 'webm', 'video/webm'),
  MPEG: createTypeInfo(TypeInfoCategory.VIDEO, 'mpeg', 'video/mpeg'),
  MPG: createTypeInfo(TypeInfoCategory.VIDEO, 'mpg', 'video/mpg'),
  M4V: createTypeInfo(TypeInfoCategory.VIDEO, 'm4v', 'video/mp4'),
  '3GP': createTypeInfo(TypeInfoCategory.VIDEO, '3gp', 'video/3gpp'),
  '3G2': createTypeInfo(TypeInfoCategory.VIDEO, '3g2', 'video/3gpp2'),
  OGV: createTypeInfo(TypeInfoCategory.VIDEO, 'ogv', 'video/ogg'),

  // Other types
  PLAYWRIGHT_TRACE: createTypeInfo(TypeInfoCategory.OTHER, 'zip', 'application/vnd.step.playwright-trace+zip', true),
};
