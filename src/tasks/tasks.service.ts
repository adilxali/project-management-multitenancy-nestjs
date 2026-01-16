import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async createTask(tenantId: string, createTaskDetails: CreateTaskDto) {
    const newTask = await this.prisma.tasks.create({
      data: {
        ...createTaskDetails,
        tenantId: BigInt(tenantId),
        projectId: BigInt(createTaskDetails.projectId),
        assignedTo: createTaskDetails.assignedTo
          ? createTaskDetails.assignedTo
          : '',
      },
    });
    return {
      id: String(newTask.id),
      ...createTaskDetails,
    };
  }
}
