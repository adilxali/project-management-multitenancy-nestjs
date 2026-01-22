import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateTaskBodyDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  projectId: string;

  @IsOptional()
  @IsString()
  assignedTo?: string;
}

export class CreateTaskDto extends CreateTaskBodyDto {
  @IsNotEmpty()
  @IsString()
  createdBy: string;

  @IsString()
  tenantId: string;
}
