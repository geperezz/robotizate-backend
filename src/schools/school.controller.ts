import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post } from '@nestjs/common'

import { SchoolNotFoundError, SchoolService } from './school.service'
import { Transaction } from 'src/db/db.transactions'
import { DbTransaction } from 'src/db/db.transactions'
import { buildAndValidateDto } from 'src/common/dto-validation'
import { SchoolCreationDto, SchoolDto, SchoolPathDto, SchoolUpdateDto } from './dtos'

@Controller('schools')
export class SchoolController {
  constructor(private readonly schoolService: SchoolService) {}

  @Get(':id')
  async getSchool(
    @Param()
    { id }: SchoolPathDto,
    @Transaction()
    transaction: DbTransaction,
  ): Promise<SchoolDto> {
    const school = await this.schoolService.getSchool(id, transaction)
    if (school === undefined) {
      throw new NotFoundException(`There is no school with ID ${id}`)
    }
    return await buildAndValidateDto(SchoolDto, school)
  }

  @Get()
  async getStudents(
    @Transaction()
    transaction: DbTransaction,
  ): Promise<SchoolDto[]> {
    const schools = await this.schoolService.getSchools(transaction)
    return Promise.all(
      schools.map(s => buildAndValidateDto(SchoolDto, s))
    )
  }

  @Post()
  async createSchool(
    @Body()
    creationData: SchoolCreationDto,
    @Transaction()
    transaction: DbTransaction,
  ): Promise<SchoolDto> {
    const newSchool = await this.schoolService.createSchool(creationData, transaction)
    return await buildAndValidateDto(SchoolDto, newSchool)
  }

  @Patch(':id')
  async updateSchool(
    @Param() 
    { id }: SchoolPathDto,
    @Body()
    updateData: SchoolUpdateDto,
    @Transaction()
    transaction: DbTransaction,
  ): Promise<SchoolDto> {
    try {
      const newSchool = await this.schoolService.updateSchool(id, updateData, transaction)
      return await buildAndValidateDto(SchoolDto, newSchool)
    } catch (error) {
      if (error instanceof SchoolNotFoundError) {
        throw new NotFoundException(`There is no school with ID ${id}`)
      }
      throw error
    }
  }

  @Delete(':id')
  async deleteSchool(
    @Param() 
    { id }: SchoolPathDto,
    @Transaction()
    transaction: DbTransaction,
  ): Promise<void> {
    try {
      await this.schoolService.deleteSchool(id, transaction)
    } catch (error) {
      if (error instanceof SchoolNotFoundError) {
        throw new NotFoundException(`There is no school with ID ${id}`)
      }
      throw error
    }
  }
}
