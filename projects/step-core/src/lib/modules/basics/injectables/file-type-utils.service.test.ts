import { FileTypeUtilsService } from './file-type-utils.service';
import { TypeInfoCategory } from '../types/type-info';

describe('FileTypeUtilsService', () => {
  const service = new FileTypeUtilsService();

  it('identifies html, htm, and xml files as text by extension', () => {
    expect(service.findByExtension('html')?.category).toBe(TypeInfoCategory.TEXT);
    expect(service.findByExtension('htm')?.category).toBe(TypeInfoCategory.TEXT);
    expect(service.findByExtension('xml')?.category).toBe(TypeInfoCategory.TEXT);
    expect(service.findByExtension('md')?.category).toBe(TypeInfoCategory.TEXT);
    expect(service.findByExtension('markdown')?.category).toBe(TypeInfoCategory.TEXT);
  });

  it('matches file extensions case-insensitively', () => {
    expect(service.findByExtension('HTML')?.category).toBe(TypeInfoCategory.TEXT);
    expect(service.findByExtension('HTM')?.category).toBe(TypeInfoCategory.TEXT);
    expect(service.findByExtension('XML')?.category).toBe(TypeInfoCategory.TEXT);
  });

  it('identifies html and xml mime types as text', () => {
    expect(service.checkTypeCategory('text/html')).toBe(TypeInfoCategory.TEXT);
    expect(service.checkTypeCategory('text/markdown')).toBe(TypeInfoCategory.TEXT);
    expect(service.checkTypeCategory('application/xml')).toBe(TypeInfoCategory.TEXT);
    expect(service.checkTypeCategory('text/xml')).toBe(TypeInfoCategory.TEXT);
  });

  it('matches mime type and extension case-insensitively', () => {
    const [html] = service.findByMimeTypeAndExtension('TEXT/HTML', 'HTML');
    expect(html?.category).toBe(TypeInfoCategory.TEXT);
  });
});
