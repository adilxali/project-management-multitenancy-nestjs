import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateTaskBodyDto {
  @IsNotEmpty({
    message: 'Task title is required',
  })
  @IsString()
  title: string;

  @IsNotEmpty({
    message: 'Project id is required',
  })
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
