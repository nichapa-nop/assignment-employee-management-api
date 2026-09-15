import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '../../common/dto/error-response.dto';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { EmployeeIdParamDto } from './dto/employee-id-param.dto';
import {
  EmployeeResponseDto,
  PaginatedEmployeesResponseDto,
} from './dto/employee-response.dto';
import { QueryEmployeeDto } from './dto/query-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeesService } from './employees.service';

@ApiTags('employees')
@ApiBadRequestResponse({ type: ErrorResponseDto })
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  @ApiOperation({ summary: 'List employees with search, filters and paging' })
  @ApiOkResponse({ type: PaginatedEmployeesResponseDto })
  findAll(
    @Query() query: QueryEmployeeDto,
  ): Promise<PaginatedEmployeesResponseDto> {
    return this.employeesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an employee by ID' })
  @ApiOkResponse({ type: EmployeeResponseDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  findOne(@Param() { id }: EmployeeIdParamDto): Promise<EmployeeResponseDto> {
    return this.employeesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create an employee' })
  @ApiCreatedResponse({ type: EmployeeResponseDto })
  create(@Body() dto: CreateEmployeeDto): Promise<EmployeeResponseDto> {
    return this.employeesService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update some fields of an employee' })
  @ApiOkResponse({ type: EmployeeResponseDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  update(
    @Param() { id }: EmployeeIdParamDto,
    @Body() dto: UpdateEmployeeDto,
  ): Promise<EmployeeResponseDto> {
    return this.employeesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an employee (soft delete)' })
  @ApiNoContentResponse()
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  remove(@Param() { id }: EmployeeIdParamDto): Promise<void> {
    return this.employeesService.remove(id);
  }
}
