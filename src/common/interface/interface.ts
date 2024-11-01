import { ROLE } from '../enum';

export interface IAuth {
  id: string;
  email?: string;
  hash: string;
  session_token: string;
  iat: number;
  exp: string;
  business_id: string;
  role: ROLE;
}
