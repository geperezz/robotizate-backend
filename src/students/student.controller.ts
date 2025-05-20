import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post } from '@nestjs/common'

import { StudentNotFoundError, StudentService } from './student.service'
import { Transaction } from 'src/db/db.transactions'
import { DbTransaction } from 'src/db/db.transactions'
import { buildAndValidateDto } from 'src/common/dto-validation'
import { StudentCreationDto, StudentDto, StudentPathDto, StudentUpdateDto } from './dtos'


@Controller('students')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get(':id')
  async getStudent(
    @Param()
    { id }: StudentPathDto,
    @Transaction()
    transaction: DbTransaction,
  ): Promise<StudentDto> {
    const student = await this.studentService.getStudent(id, transaction)
    if (student === undefined) {
      throw new NotFoundException(`There is no student with ID ${id}`)
    }
    return await buildAndValidateDto(StudentDto, student)
  }

  @Get()
  async getStudents(
    @Transaction()
    transaction: DbTransaction,
  ): Promise<StudentDto[]> {
    const students = await this.studentService.getStudents(transaction)
    return Promise.all(
      students.map(s => buildAndValidateDto(StudentDto, s))
    )
  }

  @Post()
  async createStudent(
    @Body()
    creationData: StudentCreationDto,
    @Transaction()
    transaction: DbTransaction,
  ): Promise<StudentDto> {
    const newStudent = await this.studentService.createStudent(creationData, transaction)
    return await buildAndValidateDto(StudentDto, newStudent)
  }

  @Patch(':id')
  async updateStudent(
    @Param() 
    { id }: StudentPathDto,
    @Body()
    updateData: StudentUpdateDto,
    @Transaction()
    transaction: DbTransaction,
  ): Promise<StudentDto> {
    try {
      const newStudent = await this.studentService.updateStudent(id, updateData, transaction)
      return await buildAndValidateDto(StudentDto, newStudent)
    } catch (error) {
      if (error instanceof StudentNotFoundError) {
        throw new NotFoundException(`There is no student with ID ${id}`)
      }
      throw error
    }
  }

  @Delete(':id')
  async deleteStudent(
    @Param() 
    { id }: StudentPathDto,
    @Transaction()
    transaction: DbTransaction,
  ): Promise<void> {
    try {
      await this.studentService.deleteStudent(id, transaction)
    } catch (error) {
      if (error instanceof StudentNotFoundError) {
        throw new NotFoundException(`There is no student with ID ${id}`)
      }
      throw error
    }
  }
}
