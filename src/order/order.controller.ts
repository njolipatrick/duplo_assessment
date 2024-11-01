import { Controller, Get, Post, Body, Param, Patch, Res } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AuthenticatedUser } from 'src/auth/auth.guard';
import { IAuth } from 'src/common/interface/interface';
import { Response } from 'express';
import { SuccessResponse } from 'src/utilities/response.util';
import { OrderStatus } from '@prisma/postgres/client';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  create(
    @Body() createOrderDto: CreateOrderDto,
    @AuthenticatedUser() authUser: IAuth,
  ) {
    return this.orderService.create({
      ...createOrderDto,
      curator_id: authUser.id,
      business_id: authUser.business_id,
    });
  }

  @Get()
  findAll() {
    return this.orderService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(+id);
  }
  @Patch(':id/approve')
  async completeOrder(
    @Param('id') id: string,
    @Res() res: Response,
    @AuthenticatedUser() authUser: IAuth,
  ) {
    return SuccessResponse(
      res,
      await this.orderService.orderStatus(id, authUser, OrderStatus.APPROVED),
      'Order Completed',
    );
  }
  @Patch(':id/reject')
  async rejectOrder(
    @Param('id') id: string,
    @Res() res: Response,
    @AuthenticatedUser() authUser: IAuth,
  ) {
    return SuccessResponse(
      res,
      await this.orderService.orderStatus(id, authUser, OrderStatus.REJECTED),
      'Order Completed',
    );
  }
}
