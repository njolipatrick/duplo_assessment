// import path from 'path';
import { promisify } from 'util';
import { readFile } from 'fs';

export const readPublicKey = async (name: string) => {
  const pathy = `src/pem/public_${name}.pem`;
  return promisify(readFile)(pathy, 'utf8');
};

export const readPrivateKey = async (name: string) => {
  const pathy = `src/pem/private_${name}.pem`;
  return promisify(readFile)(pathy, 'utf8');
};
