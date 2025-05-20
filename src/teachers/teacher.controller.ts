import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post } from '@nestjs/common'

import { TeacherNotFoundError, TeacherService } from './teacher.service'
import { Transaction } from 'src/db/db.transactions'
import { DbTransaction } from 'src/db/db.transactions'
import { buildAndValidateDto } from 'src/common/dto-validation'
import { TeacherCreationDto, TeacherDto, TeacherPathDto, TeacherUpdateDto } from './dtos'


@Controller('teachers')
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  @Get(':id')
  async getTeacher(
    @Param()
    { id }: TeacherPathDto,
    @Transaction()
    transaction: DbTransaction,
  ): Promise<TeacherDto> {
    const teacher = await this.teacherService.getTeacher(id, transaction)
    if (!teacher) {
      throw new NotFoundException(`There is no teacher with ID ${id}`)
    }
    return await buildAndValidateDto(TeacherDto, teacher)
  }

  @Get()
  async getTeachers(
    @Transaction()
    transaction: DbTransaction,
  ): Promise<TeacherDto[]> {
    const teachers = await this.teacherService.getTeachers(transaction)
    return Promise.all(
      teachers.map(s => buildAndValidateDto(TeacherDto, s))
    )
  }

  @Post()
  async createTeacher(
    @Body()
    creationData: TeacherCreationDto,
    @Transaction()
    transaction: DbTransaction,
  ): Promise<TeacherDto> {
    const newTeacher = await this.teacherService.createTeacher(creationData, transaction)
    return await buildAndValidateDto(TeacherDto, newTeacher)
  }

  @Patch(':id')
  async updateTeacher(
    @Param() 
    { id }: TeacherPathDto,
    @Body()
    updateData: TeacherUpdateDto,
    @Transaction()
    transaction: DbTransaction,
  ): Promise<TeacherDto> {
    try {
      const newTeacher = await this.teacherService.updateTeacher(id, updateData, transaction)
      return await buildAndValidateDto(TeacherDto, newTeacher)
    } catch (error) {
      if (error instanceof TeacherNotFoundError) {
        throw new NotFoundException(`There is no teacher with ID ${id}`)
      }
      throw error
    }
  }

  @Delete(':id')
  async deleteTeacher(
    @Param() 
    { id }: TeacherPathDto,
    @Transaction()
    transaction: DbTransaction,
  ): Promise<void> {
    try {
      await this.teacherService.deleteTeacher(id, transaction)
    } catch (error) {
      if (error instanceof TeacherNotFoundError) {
        throw new NotFoundException(`There is no teacher with ID ${id}`)
      }
      throw error
    }
  }
}
