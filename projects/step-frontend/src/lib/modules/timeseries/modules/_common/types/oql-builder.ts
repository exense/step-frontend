export class OQLBuilder {
  clauses: string[] = [];
  separator: string = 'and';
  isOpen = true;

  open(separator: string): OQLBuilder {
    this.separator = separator;
    this.isOpen = true;
    return this;
  }

  close(): OQLBuilder {
    let clause = this.build();
    this.clauses = [clause];
    this.isOpen = false;
    return this;
  }

  append(clause?: string): OQLBuilder {
    if (clause) {
      this.clauses.push(clause);
    }
    return this;
  }

  conditionalAppend(condition: boolean, clause?: string) {
    if (condition) {
      this.append(clause);
    }
    return this;
  }

  lt(attribute: string, value: number) {
    this.append(`(${attribute} < ${value})`);
    return this;
  }

  gte(attribute: string, value: number) {
    this.append(`(${attribute} >= ${value})`);
    return this;
  }

  build(): string {
    return this.clauses.join(' ' + this.separator + ' ');
  }
}
