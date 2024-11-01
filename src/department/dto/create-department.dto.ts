import { IsEmail, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateDepartmentDto {
  @IsNotEmpty()
  @IsEmail({}, { message: 'Provide a valid email address' })
  email: string;

  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @IsNotEmpty()
  @IsUUID()
  readonly business_id: string;
}
