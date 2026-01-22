import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UsersService } from 'src/users/users.service';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    private prisma: PrismaService,
    private users: UsersService,
  ) { }

  async createProject(tenantId: number, project: CreateProjectDto) {
    const isTentantExist = await this.users.chechTenantExists(tenantId);
    if (!isTentantExist) {
      throw new HttpException(
        {
          code: HttpStatus.BAD_REQUEST,
          message: 'Invalid tenant found',
          success: false,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const { name, description } = project;
    const data = await this.prisma.projects.create({
      data: {
        name,
        description,
        tenantId,
      },
    });
    return { ...data, id: String(data.id), tenantId: String(data.tenantId) };
  }

  async getProjects(tenantId: number) {
    return (
      await this.prisma.projects.findMany({
        where: { tenantId },
      })
    ).map((project) => ({
      ...project,
      id: String(project.id),
      tenantId: String(project.tenantId),
    }));
  }

  async deleteProject(tenantId: string, projectId: string) {
    const isProjectExist = await this.getProjectById(tenantId, projectId);
    if (!isProjectExist) {
      throw new HttpException(
        {
          success: false,
          message: 'Project not exist',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const project = await this.prisma.projects.delete({
      where: {
        id: BigInt(projectId),
        tenantId: BigInt(tenantId),
      },
    });
    return {
      ...project,
      id: project.id.toString(),
      tenantId: project.tenantId.toString(),
    };
  }

  async getProjectById(tenantId: string, projectId: string) {
    try {
      const project = await this.prisma.projects.findFirstOrThrow({
        where: { id: BigInt(projectId), tenantId: BigInt(tenantId) },
      });
      return {
        ...project,
        id: String(project.id),
        tenantId: String(project.tenantId),
      };
    } catch (err) {
      throw new HttpException(
        {
          success: false,
          message: 'Project not found',
          status: HttpStatus.NOT_FOUND,
          err: err,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async updateProjectDetails(
    tenantId: string,
    projectId: string,
    projectDetails: UpdateProjectDto,
  ) {
    const isProjectExist = await this.getProjectById(tenantId, projectId);
    if (!isProjectExist) {
      throw new HttpException(
        {
          success: false,
          message: 'Project not found',
          status: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const { name, description } = projectDetails;
    const newDetails: UpdateProjectDto = {};
    if (name) {
      newDetails.name = name;
    }
    if (description) {
      newDetails.description = description;
    }
    const project = await this.prisma.projects.update({
      where: {
        id: BigInt(projectId),
        tenantId: BigInt(tenantId),
      },
      data: {
        ...newDetails,
      },
    });
    return {
      ...project,
      id: String(project.id),
      tenantId: String(project.tenantId),
    };
  }
}
