/* eslint-disable no-console */

import { readFile } from 'fs/promises';
import { glob } from 'glob';
import check from './check';

let hasError = false;
let checked = false;

(async () => {
  await Promise.all(process.argv.slice(1).map(async (arg) => {
    const paths = await glob(arg, { nodir: true }).catch((e) => {
      console.error(`glob error: [${arg}] (${e})`);
      process.exit(1);
    });
    await Promise.all(paths.map(async (path) => {
      const content = await readFile(path, 'utf-8');
      const result = check(content);
      checked = true;
      if (result !== true) {
        console.error(`${path}:\n${result}\n`);
        hasError = true;
      }
    }));
  }));

  if (!checked) {
    console.error('No file was checked');
    process.exit(1);
  }
  if (hasError) {
    process.exit(2);
  }
})();
