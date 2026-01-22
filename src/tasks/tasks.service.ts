import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { ProjectsService } from 'src/projects/projects.service';
import { UpdateTaskBodyDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(
    private prisma: PrismaService,
    private projectsService: ProjectsService,
  ) {}

  async createTask(createTaskDetails: CreateTaskDto) {
    const { projectId, tenantId } = createTaskDetails;
    return await this.prisma.$transaction(async (txn) => {
      const isProjectExist = await txn.projects.findUnique({
        where: { id: BigInt(projectId), tenantId: BigInt(tenantId) },
      });
      if (!isProjectExist) {
        throw new HttpException(
          {
            code: HttpStatus.NOT_FOUND,
            message: 'Project Not Found',
            success: false,
          },
          HttpStatus.NOT_FOUND,
        );
      }
      const newTask = await txn.tasks.create({
        data: {
          ...createTaskDetails,
          tenantId: BigInt(createTaskDetails.tenantId),
          projectId: BigInt(createTaskDetails.projectId),
          assignedTo: createTaskDetails.assignedTo
            ? createTaskDetails.assignedTo
            : '',
        },
      });
      return {
        ...createTaskDetails,
        id: String(newTask.id),
      };
    });
  }

  async projectAllTasks(projectId: string, tenantId: string) {
    return await this.prisma.$transaction(async (txn) => {
      const isProjectExist = await txn.tasks.findUnique({
        where: { id: BigInt(projectId), tenantId: BigInt(tenantId) },
      });
      if (!isProjectExist) {
        throw new HttpException(
          {
            code: HttpStatus.NOT_FOUND,
            message: 'Project Not Found',
            success: false,
          },
          HttpStatus.NOT_FOUND,
        );
      }
      return (
        await txn.tasks.findMany({
          where: {
            projectId: BigInt(projectId),
            tenantId: BigInt(tenantId),
          },
        })
      ).map((task) => ({
        ...task,
        id: String(task.id),
        tenantId: String(task.tenantId),
        projectId: String(task.projectId),
      }));
    });
  }
  async updateTask(
    projectId: string,
    taskId: string,
    tenantId: string,
    data: UpdateTaskBodyDto,
  ) {
    // await this.projectsService.getProjectById(tenantId, projectId);

    // const [updateResult, updatedTask] = await this.prisma.$transaction([
    //   this.prisma.tasks.updateMany({
    //     where: {
    //       id: BigInt(taskId),
    //       projectId: BigInt(projectId),
    //       tenantId: BigInt(tenantId),
    //     },
    //     data,
    //   }),

    //   this.prisma.tasks.findFirst({
    //     where: {
    //       id: BigInt(taskId),
    //       projectId: BigInt(projectId),
    //       tenantId: BigInt(tenantId),
    //     },
    //   }),
    // ]);

    // if (updateResult.count === 0 || !updatedTask) {
    //   throw new NotFoundException({
    //     success: false,
    //     message: 'Task not found or access denied',
    //   });
    // }

    // return {
    //   data: {
    //     ...updatedTask,
    //     id: String(updatedTask.id),
    //     projectId: String(updatedTask.projectId),
    //     tenantId: String(updatedTask.tenantId),
    //   },
    //   success: true,
    //   message: 'Task updated successfully',
    // };
    return await this.prisma.$transaction(async (txn) => {
      const isProjectExist = await txn.projects.findUnique({
        where: {
          id: BigInt(projectId),
          tenantId: BigInt(tenantId),
        },
      });
      if (!isProjectExist) {
        throw new NotFoundException({
          success: false,
          message: 'Project  not found',
        });
      }
      const exitingTaskDetails = await txn.tasks.findUnique({
        where: {
          id: BigInt(taskId),
        },
      });
      if (!exitingTaskDetails) {
        throw new NotFoundException({
          success: false,
          message: 'Task not found.',
        });
      }
      const updatedTask = await txn.tasks.update({
        where: {
          id: BigInt(taskId),
        },
        data,
      });
      return {
        data: {
          ...updatedTask,
          id: String(updatedTask.id),
          projectId: String(updatedTask.projectId),
          tenantId: String(updatedTask.tenantId),
        },
        success: true,
        message: 'Task updated successfully',
      };
    });
  }
}
