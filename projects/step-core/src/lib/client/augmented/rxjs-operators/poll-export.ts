import { ExportsService, ExportStatus } from '../../generated';
import { Observable, of, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';

export const pollExport = (
  exportService: ExportsService,
  pollCount: number = 4
): ((src: Observable<ExportStatus>) => Observable<ExportStatus>) => {
  return (src) =>
    src.pipe(
      switchMap((status) => {
        if (!status || status.ready || pollCount === 0 || !status.id) {
          return of(status);
        }

        const id = status.id;
        return timer(500).pipe(
          switchMap((_) => exportService.getExportStatus(id)),
          pollExport(exportService, pollCount - 1)
        );
      })
    );
};
