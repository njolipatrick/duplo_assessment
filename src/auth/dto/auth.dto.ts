import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ROLE } from 'src/common/enum';

export class UserLoginDTO {
  @IsNotEmpty()
  @IsEmail({}, { message: 'A valid email must be provided.' })
  readonly email: string;

  @IsNotEmpty()
  @IsString({ message: 'A valid password must be provided' })
  readonly password: string;
}
export class InviteDTO {
  @IsNotEmpty()
  @IsEmail({}, { message: 'A valid email must be provided.' })
  readonly email: string;

  @IsNotEmpty()
  @IsString({ message: 'A valid password must be provided' })
  @IsEnum(ROLE)
  readonly role: ROLE;

  @IsNotEmpty()
  @IsUUID('all', { message: 'A valid department id must be provided' })
  readonly department_id: string;
}

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  readonly full_name: string;

  @IsString()
  @IsOptional()
  readonly password: string;

  @IsNotEmpty()
  @IsEmail()
  readonly email: string;
}
