import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { BusinessService } from './business.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { AuthenticatedUser } from 'src/auth/auth.guard';
import { IAuth } from 'src/common/interface/interface';
import { ROLE } from 'src/common/enum';

@Controller('business')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Post()
  create(
    @Body() createBusinessDto: CreateBusinessDto,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @AuthenticatedUser([ROLE.DULPO_ADMIN]) authUser: IAuth,
  ) {
    return this.businessService.create(createBusinessDto);
  }

  @Get()
  findAll() {
    return this.businessService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.businessService.findOne({ id });
  }
}
