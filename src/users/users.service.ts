import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createUser(createUserDto: CreateUserDto) {
    const userExists = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });
    if (userExists) {
      throw new Error('User with this email already exists');
    }
    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
      },
    });
    return user;
  }
}
