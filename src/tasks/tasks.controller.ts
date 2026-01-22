import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { Tenant } from 'src/common/decorators/tenant.decorator';
import { Token } from 'src/common/decorators/token.decorator';
import { UsersService } from 'src/users/users.service';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateTaskDto, CreateTaskBodyDto } from './dto/create-task.dto';
import { UpdateTaskBodyDto } from './dto/update-task.dto';

UseGuards(JwtAuthGuard);
@Controller('tasks')
export class TasksController {
  constructor(
    private userService: UsersService,
    private tasksService: TasksService,
  ) {}
  @Post('')
  async createTask(
    @Tenant() tenantId: string,
    @Token() token: string,
    @Body()
    req: CreateTaskBodyDto,
  ) {
    const user = await this.userService.getAuthUser(tenantId, token);
    if (!user) {
      return { error: 'opps' };
    }
    const data: CreateTaskDto = {
      ...req,
      createdBy: String(user.id),
      tenantId: String(user.tenantId),
    };
    return this.tasksService.createTask(data);
  }
  @Get(':projectId')
  async getAllTasks(
    @Param('projectId') projectId: string,
    @Tenant() tenantId: string,
  ) {
    return await this.tasksService.projectAllTasks(projectId, tenantId);
  }
  @Put(':projectId/:taskId')
  async updateTask(
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
    @Tenant() tenantId: string,
    @Body() data: UpdateTaskBodyDto,
  ) {
    return await this.tasksService.updateTask(
      projectId,
      taskId,
      tenantId,
      data,
    );
  }
}
