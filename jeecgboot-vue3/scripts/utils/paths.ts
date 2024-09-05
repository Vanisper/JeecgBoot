import { resolve } from 'node:path';
import { findRootPath } from './_utils';

/** 项目根目录 `/`  */
export const projRoot = findRootPath() || resolve(__dirname, '../../');
/** 包目录 `/packages` */
export const pkgRoot = resolve(projRoot, 'packages');
