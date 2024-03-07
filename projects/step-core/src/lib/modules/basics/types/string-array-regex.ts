export const arrayToRegex = (items: string[]): string => {
  let value = '';
  if (items.length === 1) {
    value = `^${items[0]}$`;
  } else if (items.length > 1) {
    value = items.map((item) => `^${item}$`).join('|');
    value = `(${value})`;
  }
  return value;
};

export const regexToArray = (regexString: string): string[] => {
  let result: string[];

  if (regexString.startsWith('(') && regexString.endsWith(')') && regexString.includes('|')) {
    result = regexString.substring(1, regexString.length - 1).split('|');
  } else {
    result = [regexString];
  }

  return result.map((value) => {
    if (value.startsWith('^') && value.endsWith('$')) {
      return value.substring(1, value.length - 1);
    }
    return value;
  });
};
