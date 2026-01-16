import {
  Controller,
  Post,
  UseGuards,
  Body,
  Get,
  Delete,
  Param,
  Put,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Tenant } from 'src/common/decorators/tenant.decorator';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private projectService: ProjectsService) {}
  @Post('')
  async createProject(
    @Tenant() tenantId: number,
    @Body() body: CreateProjectDto,
  ) {
    return this.projectService.createProject(tenantId, body);
  }

  @Get('')
  async getProjects(@Tenant() tentantId: number) {
    return this.projectService.getProjects(tentantId);
  }

  @Delete(':id')
  async deleteProject(@Tenant() tentantId: string, @Param('id') id: string) {
    return this.projectService.deleteProject(String(tentantId), id);
  }

  @Put(':id')
  async updateProject(
    @Tenant() tentantId: string,
    @Param('id') id: string,
    @Body() projectDetails: UpdateProjectDto,
  ) {
    return this.projectService.updateProjectDetails(
      tentantId,
      id,
      projectDetails,
    );
  }
}
