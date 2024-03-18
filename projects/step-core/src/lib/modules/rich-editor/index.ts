import { RichEditorComponent } from './components/rich-editor/rich-editor.component';
import { RichEditorDialogComponent } from './components/rich-editor-dialog/rich-editor-dialog.component';

export * from './components/rich-editor/rich-editor.component';
export * from './components/rich-editor-dialog/rich-editor-dialog.component';
export * from './injectables/rich-editor-dialog.service';
export * from './types/ace-mode.enum';

export const RICH_EDITOR_EXPORTS = [RichEditorComponent, RichEditorDialogComponent];
