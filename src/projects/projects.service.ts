import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class ProjectsService {
  constructor(
    private prisma: PrismaService,
    private users: UsersService,
  ) {}

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
    return await this.prisma.projects.delete({
      where: {
        id: BigInt(projectId),
        tenantId: BigInt(tenantId),
      },
    });
  }
}
