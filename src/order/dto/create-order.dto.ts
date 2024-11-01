import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { OrderStatus } from 'src/common/enum';

export class CreateOrderDto {
  @IsNotEmpty()
  @IsString({ message: 'A valid order status must be provided' })
  @IsEnum(OrderStatus)
  readonly status: OrderStatus;

  @IsOptional()
  @IsString({ message: 'A valid description must be provided' })
  readonly description: string;

  @IsOptional()
  @IsString({ message: 'A valid item must be provided' })
  readonly item: string;

  @IsNotEmpty()
  @IsInt({ message: 'A valid amount must be provided' })
  readonly amount: number;

  @IsOptional()
  @IsString({ message: 'A valid order date must be provided' })
  readonly order_date = new Date();
}
