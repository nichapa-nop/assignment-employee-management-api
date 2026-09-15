import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({ example: 'Bad Request' })
  error: string;

  @ApiProperty({
    oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
    example: ['name should not be empty'],
  })
  message: string | string[];

  @ApiProperty({ example: '/api/employees' })
  path: string;

  @ApiProperty({ example: '2026-09-15T08:00:00.000Z' })
  timestamp: string;
}
