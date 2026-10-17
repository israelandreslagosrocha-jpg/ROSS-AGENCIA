import { cp, mkdir, rm } from 'node:fs/promises';
await rm(new URL('../dist/', import.meta.url), { recursive: true, force: true });
await mkdir(new URL('../dist/', import.meta.url), { recursive: true });
await cp(new URL('../site/', import.meta.url), new URL('../dist/', import.meta.url), { recursive: true });
console.log('Demo estática preparada en dist/. No contiene backend ni datos privados.');
