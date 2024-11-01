import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import { IAuth } from 'src/common/interface/interface';
import {
  PrismaMongoService,
  PrismaPostgresService,
} from 'src/prisma/prisma.service';
import { generateRandomCode } from 'src/utilities/util';

@Injectable()
export class OrderService {
  constructor(
    private prisma: PrismaPostgresService,
    private prismaMongo: PrismaMongoService,
  ) {}
  async create(createOrderDto: Prisma.OrderUncheckedCreateInput) {
    //generate ref
    const reference = this.orderReferenceGenerator();
    //get department
    const department = await this.prisma.department.findFirst({
      where: {
        head_id: createOrderDto.curator_id,
        business_id: createOrderDto.business_id,
      },
    });
    if (!department) {
      throw new UnauthorizedException(
        'Only head of department can create an Order',
      );
    }
    const data: Partial<Prisma.OrderUncheckedCreateInput> = {
      ...createOrderDto,
      reference,
      department_id: department.id,
    };
    const order = await this.prisma.order.create({ data });
    return order;
  }
  async orderReferenceGenerator() {
    const reference = generateRandomCode();
    const order = await this.prisma.order.findFirst({
      where: { reference },
    });
    if (order) {
      return this.orderReferenceGenerator();
    }
    return reference;
  }
  findAll() {
    return `This action returns all order`;
  }

  findOne(id: number) {
    return `This action returns a #${id} order`;
  }

  async orderStatus(id: string, authUser: IAuth, status: string) {
    //TODO: Confirm if the user is a the head of the deparment before this whole operation
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    await this.prismaMongo.transactionLog.create({
      data: {
        user_id: authUser.id,
        business_id: order.business_id,
        status,
        department_id: order.department_id,
        amount: order.amount,
        metadata: order,
      },
    });
    await this.prisma.order.update({
      where: { id },
      data: { status: OrderStatus[status] },
    });
  }
  async creditScore(business_id: string) {
    const transactions = await this.prismaMongo.transactionLog.findMany({
      where: { business_id },
    });
    if (!transactions) return 0;

    // Initialize metrics
    let total_amount = 0;
    let approved_transactions = 0;
    let rejected_transactions = 0;
    let on_time_transactions = 0;

    for (let index = 0; index < transactions.length; index++) {
      const log = transactions[index];
      total_amount += log.amount;

      if (log.status === OrderStatus.APPROVED) {
        approved_transactions++;
        const order = await this.prisma.order.findUnique({
          where: { id: log.order_id },
        });
        if (order && new Date(order.order_date) <= new Date(log.created_at)) {
          on_time_transactions++;
        }
      } else {
        rejected_transactions++;
      }
    }

    // Calculate derived metrics
    const transaction_count = transactions.length;
    const success_rate = approved_transactions / transaction_count;
    const failure_rate = rejected_transactions / transaction_count;
    const on_time_rate = on_time_transactions / approved_transactions || 0;
    const average_transaction_amount = total_amount / transaction_count || 0;

    const score =
      success_rate * 40 + // Weight for success rate
      on_time_rate * 30 + // Weight for on-time payments
      (1 - failure_rate) * 20 + // Penalty for failed transactions
      Math.min(average_transaction_amount / 1000, 10); // Bonus for high transaction amounts

    return Math.min(Math.max(Math.round(score), 0), 100);
  }
}
