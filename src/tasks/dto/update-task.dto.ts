import { IsNotEmpty, IsOptional, IsString, IsEnum } from 'class-validator';
import { TaskStatus } from '../../../generated/prisma/client';

export class UpdateTaskBodyDto {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsNotEmpty()
  @IsEnum(TaskStatus)
  status: TaskStatus;

  @IsOptional()
  @IsString()
  assignedTo?: string;
}
