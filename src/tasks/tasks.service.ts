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
import { Prisma } from 'generated/prisma/client';
@Injectable()
export class TasksService {
  constructor(
    private prisma: PrismaService,
    private projectsService: ProjectsService,
  ) {}

  async createTask(createTaskDetails: CreateTaskDto) {
    const { projectId, tenantId } = createTaskDetails;
    return this.prisma.$transaction(async (txn) => {
      const isProjectExist = await txn.projects.findUniqueOrThrow({
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
    const isProjectExist = await this.projectsService.getProjectById(
      tenantId,
      projectId,
    );
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
    const projectTasks = await this.prisma.tasks.findMany({
      where: { projectId: BigInt(projectId), tenantId: BigInt(tenantId) },
    });
    const formattedData = projectTasks.map((task) => ({
      ...task,
      id: String(task.id),
      tenantId: String(task.tenantId),
      projectId: String(task.projectId),
    }));
    return {
      success: true,
      message: 'Tasks fetched successfully',
      data: formattedData,
    };
  }
  async updateTask(
    projectId: string,
    taskId: string,
    tenantId: string,
    token: string,
    data: UpdateTaskBodyDto,
  ) {
    const tenantIdBI = BigInt(tenantId);
    const projectIdBI = BigInt(projectId);
    const taskIdBI = BigInt(taskId);

    return this.prisma.$transaction(async (txn) => {
      const [user, project] = await Promise.all([
        txn.user.findUnique({
          where: {
            tenantId_authToken: {
              tenantId: tenantIdBI,
              authToken: token,
            },
          },
        }),
        txn.projects.findUnique({
          where: {
            id: projectIdBI,
            tenantId: tenantIdBI,
          },
        }),
      ]);

      if (!user) {
        throw new NotFoundException({
          success: false,
          message: 'User not found',
        });
      }

      if (!project) {
        throw new NotFoundException({
          success: false,
          message: 'Project not found',
        });
      }
      const existingTask = await txn.tasks.findUnique({
        where: { id: taskIdBI },
      });

      if (!existingTask) {
        throw new NotFoundException({
          success: false,
          message: 'Task not found',
        });
      }
      const updatedTask = await txn.tasks.update({
        where: { id: taskIdBI },
        data,
      });
      const historyEntries: Prisma.TaskHistoryCreateManyInput[] = [];

      const baseHistory = {
        taskId: existingTask.id,
        projectId: projectIdBI,
        tenantId: tenantIdBI,
        updatedBy: user.id,
        oldStatus: existingTask.status,
        newStatus: updatedTask.status,
      };

      if (data.status && data.status !== existingTask.status) {
        historyEntries.push({
          ...baseHistory,
          historyType: 'STATUS_CHANGE',
        });
      }

      if (
        data.assignedTo !== undefined &&
        data.assignedTo !== existingTask.assignedTo
      ) {
        historyEntries.push({
          ...baseHistory,
          historyType: 'ASSIGNMENT_CHANGE',
        });
      }

      if (data.title && data.title !== existingTask.title) {
        historyEntries.push({
          ...baseHistory,
          historyType: 'DETAIL_UPDATE',
        });
      }

      if (historyEntries.length) {
        await txn.taskHistory.createMany({ data: historyEntries });
      }
      return {
        success: true,
        message: 'Task updated successfully',
        data: {
          ...updatedTask,
          id: String(updatedTask.id),
          projectId: String(updatedTask.projectId),
          tenantId: String(updatedTask.tenantId),
        },
      };
    });
  }

  async deleteTask(projectId: string, taskId: string) {
    return this.prisma.$transaction(async (txn) => {
      const existingTask = await txn.tasks.findUnique({
        where: { id: BigInt(taskId), projectId: BigInt(projectId) },
      });
      if (!existingTask) {
        throw new NotFoundException({
          success: false,
          message: 'Task not found',
        });
      }
      const deleteTask = await txn.tasks.delete({
        where: { id: BigInt(taskId), projectId: BigInt(projectId) },
      });
      return {
        success: true,
        message: 'Task deleted successfully',
        data: {
          ...deleteTask,
          id: String(deleteTask.id),
          projectId: String(deleteTask.projectId),
          tenantId: String(deleteTask.tenantId),
        },
      };
    });
  }
}
