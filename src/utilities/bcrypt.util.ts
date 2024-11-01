import * as bcrypt from 'bcrypt';

export const bcryptHash = async (password: string) => {
  const saltOrRounds = Number(process.env.SALT_ROUND || 10);

  return await bcrypt.hash(password, saltOrRounds);
};

export const bcryptCompare = async (password: string, hash?: string) => {
  console.log(password, hash);
  return bcrypt.compare(password, String(hash));
};
