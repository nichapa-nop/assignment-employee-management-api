import { Injectable } from '@nestjs/common';
import { Department } from './enums/department.enum';

@Injectable()
export class DepartmentsService {
  findAll(): Department[] {
    return Object.values(Department);
  }
}
