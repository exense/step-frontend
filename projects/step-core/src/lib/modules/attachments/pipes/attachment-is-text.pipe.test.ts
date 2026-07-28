import { AttachmentIsTextPipe } from './attachment-is-text.pipe';
import { AttachmentMeta } from '../../../client/step-client-module';

describe('AttachmentIsTextPipe', () => {
  it('identifies supported text attachment extensions', () => {
    expect(isTextAttachment('report.html')).toBe(true);
    expect(isTextAttachment('report.htm')).toBe(true);
    expect(isTextAttachment('report.xml')).toBe(true);
    expect(isTextAttachment('report.log')).toBe(true);
    expect(isTextAttachment('report.txt')).toBe(true);
    expect(isTextAttachment('report.md')).toBe(true);
    expect(isTextAttachment('report.markdown')).toBe(true);
  });

  it('matches extensions case-insensitively', () => {
    expect(isTextAttachment('report.HTML')).toBe(true);
    expect(isTextAttachment('report.HTM')).toBe(true);
    expect(isTextAttachment('report.XML')).toBe(true);
    expect(isTextAttachment('report.MARKDOWN')).toBe(true);
  });

  it('rejects unsupported extensions', () => {
    expect(isTextAttachment('report.png')).toBe(false);
    expect(isTextAttachment('report.xml.zip')).toBe(false);
  });
});

const isTextAttachment = (name: string): boolean => {
  return AttachmentIsTextPipe.transform({ name, type: 'attachment' } as AttachmentMeta);
};
