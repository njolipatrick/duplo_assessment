import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { DepartmentService } from './department.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { AuthenticatedUser } from 'src/auth/auth.guard';
import { IAuth } from 'src/common/interface/interface';
import { ROLE } from 'src/common/enum';

@Controller('department')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Post()
  create(
    @Body() createDepartmentDto: CreateDepartmentDto,
    @AuthenticatedUser([ROLE.BUSINESS_OWNER]) { business_id }: IAuth,
  ) {
    return this.departmentService.create({
      ...createDepartmentDto,
      business_id,
    });
  }

  @Get()
  findAll() {
    return this.departmentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.departmentService.findOne({ id });
  }
}
