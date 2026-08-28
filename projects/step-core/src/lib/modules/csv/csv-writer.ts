export type CSVValue = string | number | boolean | Date | null | undefined;

export class CSVWriter {
  private readonly rows: CSVValue[][] = [];

  constructor(private readonly headers: string[]) {}

  add(row: CSVValue[]): this {
    this.rows.push(row);
    return this;
  }

  export(fileName: string = 'export.csv'): void {
    const csv = [this.headers, ...this.rows]
      .map((row) => row.map((value) => this.escape(value)).join(','))
      .join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = fileName.toLowerCase().endsWith('.csv') ? fileName : `${fileName}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url));
  }

  private escape(value: CSVValue): string {
    const text = value instanceof Date ? value.toISOString() : String(value ?? '');
    return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  }
}
