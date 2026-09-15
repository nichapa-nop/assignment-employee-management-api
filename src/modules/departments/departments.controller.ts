import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DepartmentsService } from './departments.service';
import { Department } from './enums/department.enum';

@ApiTags('departments')
@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Get()
  @ApiOperation({ summary: 'List departments for the dropdown' })
  @ApiOkResponse({
    schema: {
      type: 'array',
      items: { type: 'string', enum: Object.values(Department) },
    },
  })
  findAll(): Department[] {
    return this.departmentsService.findAll();
  }
}
