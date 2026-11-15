#!/usr/bin/env node
// Derleme sonrası: service worker sürümünü damgalar ve ön yükleme listesini yazar.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

const DIST = new URL('../dist/', import.meta.url).pathname;
const assets = readdirSync(join(DIST, 'assets')).map((f) => '/esoterica/assets/' + f);
const surum = createHash('sha256').update(assets.join('|')).digest('hex').slice(0, 10);

const swPath = join(DIST, 'sw.js');
writeFileSync(swPath, readFileSync(swPath, 'utf8').replace('__SURUM__', surum));
writeFileSync(join(DIST, 'onyukle.json'), JSON.stringify(assets));
console.log(`sw sürümü ${surum}, ${assets.length} dosya ön yükleme listesinde`);
