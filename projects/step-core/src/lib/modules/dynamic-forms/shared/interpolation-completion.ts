interface InterpolationRange {
  start: number;
  end: number;
  prefix: string;
}

function isIdentifierCharacter(value: string, index: number): boolean {
  const character = value[index];
  return character !== undefined && /\w/.test(character);
}

function findTokenStart(value: string, caret: number): number {
  let start = caret;
  if (value[start - 1] === '.' && isIdentifierCharacter(value, start - 2)) {
    start--;
  }
  while (isIdentifierCharacter(value, start - 1)) {
    start--;
    if (value[start - 1] === '.' && isIdentifierCharacter(value, start - 2)) {
      start--;
    }
  }
  return start;
}

function findTokenEnd(value: string, caret: number): number {
  let end = caret;
  while (isIdentifierCharacter(value, end) || (value[end] === '.' && isIdentifierCharacter(value, end + 1))) {
    end++;
  }
  return end;
}

export function getInterpolationRange(value: string, selectionStart: number, selectionEnd: number): InterpolationRange {
  const tokenStart = findTokenStart(value, selectionStart);
  const hasSelection = selectionStart !== selectionEnd;
  const isPlaceholder = value[tokenStart - 2] === '$' && value[tokenStart - 1] === '{';
  if (!isPlaceholder && (hasSelection || tokenStart === selectionStart)) {
    return { start: selectionStart, end: selectionEnd, prefix: '' };
  }

  const tokenEnd = findTokenEnd(value, selectionStart);
  const prefix = hasSelection ? '' : value.slice(tokenStart, selectionStart);
  if (isPlaceholder) {
    const end = value[tokenEnd] === '}' ? tokenEnd + 1 : tokenEnd;
    if (selectionEnd <= end) {
      return { start: tokenStart - 2, end, prefix };
    }
    return { start: selectionStart, end: selectionEnd, prefix };
  }
  return { start: tokenStart, end: tokenEnd, prefix };
}

export function completeInterpolation(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  expression: string,
): { value: string; caret: number } {
  const { start, end } = getInterpolationRange(value, selectionStart, selectionEnd);
  const placeholder = `\${${expression}}`;
  return {
    value: value.slice(0, start) + placeholder + value.slice(end),
    caret: start + placeholder.length,
  };
}
