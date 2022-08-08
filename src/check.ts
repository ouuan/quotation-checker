const dict = {
  '“': {
    type: 'double',
    pos: 'left',
  },
  '”': {
    type: 'double',
    pos: 'right',
  },
  '‘': {
    type: 'single',
    pos: 'left',
  },
  '’': {
    type: 'single',
    pos: 'right',
  },
} as const;

function error(message: string, line: string, row: number, col: number) {
  return `${row + 1}:${col + 1} ${message}: ${line.substring(col - 10, col + 11)}`;
}

function isQuote(char: string): char is keyof typeof dict {
  return char in dict;
}

export default function check(content: string): true | string {
  const errors = content.split(/\n|\r\n?/).map((line, row) => {
    const quotations: [string, number][] = [];
    for (const [col, c] of line.split('').entries()) {
      if (!isQuote(c)) continue;
      const info = dict[c];
      if (info.pos === 'left') {
        if (quotations.length > 0 && quotations[quotations.length - 1][0] === info.type) {
          return error('nesting error', line, row, col);
        }
        quotations.push([info.type, col]);
      } else {
        const last = quotations.pop();
        if (last?.[0] !== info.type) {
          if (info.type === 'double') {
            return error('does not match', line, row, col);
          }
          // apostrophe
          if (last) quotations.push(last);
        }
      }
    }
    if (quotations.length > 0) {
      return error('does not match', line, row, quotations[quotations.length - 1][1]);
    }
    return null;
  }).filter((i) => i);
  if (errors.length > 0) {
    return errors.join('\n');
  }
  return true;
}
