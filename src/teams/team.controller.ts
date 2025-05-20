import { BadRequestException, Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post } from '@nestjs/common'

import { InvalidCaptainError, InvalidStudentSchoolError, InvalidTeacherSchoolError, SchoolNotFoundError, StudentNotFoundError, TeacherNotFoundError, TeamNotFoundError, TeamService } from './team.service'
import { Transaction } from 'src/db/db.transactions'
import { DbTransaction } from 'src/db/db.transactions'
import { buildAndValidateDto } from 'src/common/dto-validation'
import { TeamCreationDto, TeamDto, TeamPathDto, TeamUpdateDto } from './dtos'


@Controller('teams')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Get(':id')
  async getTeam(
    @Param()
    { id }: TeamPathDto,
    @Transaction()
    transaction: DbTransaction,
  ): Promise<TeamDto> {
    const team = await this.teamService.getTeam(id, transaction)
    if (!team) {
      throw new NotFoundException(`There is no team with ID ${id}`)
    }
    return await buildAndValidateDto(TeamDto, team)
  }

  @Get()
  async getTeams(
    @Transaction()
    transaction: DbTransaction,
  ): Promise<TeamDto[]> {
    const teams = await this.teamService.getTeams(transaction)
    return Promise.all(
      teams.map(t => buildAndValidateDto(TeamDto, t))
    )
  }

  @Post()
  async createTeam(
    @Body()
    creationData: TeamCreationDto,
    @Transaction()
    transaction: DbTransaction,
  ): Promise<TeamDto> {
    try {
      const newTeam = await this.teamService.createTeam(creationData, transaction)
      return await buildAndValidateDto(TeamDto, newTeam)
    } catch (error) {
      if (error instanceof SchoolNotFoundError) {
        throw new BadRequestException({
          message: 'Invalid creation data',
          errors: [{
            property: 'schoolId',
            description: `There is no school with ID ${creationData.schoolId}`,
          }],
        }, { cause: error })
      }
      if (error instanceof TeacherNotFoundError) {
        throw new BadRequestException({
          message: 'Invalid creation data',
          errors: [{
            property: 'teacherInChargeId',
            description: `There is no teacher with ID ${creationData.teacherInChargeId}`,
          }],
        }, { cause: error })
      }
      if (error instanceof InvalidTeacherSchoolError) {
        throw new BadRequestException({
          message: 'Invalid creation data',
          errors: [{
            property: 'teacherInChargeId',
            error: `The teacher must be from the school with ID ${error.expectedSchoolId}`,
          }],
        }, { cause: error })
      }
      if (error instanceof StudentNotFoundError) {
        throw new BadRequestException({
          message: 'Invalid creation data',
          errors: [{
            property: 'studentIds',
            description: 'There is a non-existent student in the array',
          }],
        }, { cause: error })
      }
      if (error instanceof InvalidStudentSchoolError) {
        throw new BadRequestException({
          message: 'Invalid creation data',
          errors: [{
            property: 'studentIds',
            description: `The student with ID ${error.studentId} studies in a different school than the team's one`,
          }],
        }, { cause: error })
      }
      if (error instanceof InvalidCaptainError) {
        throw new BadRequestException({
          message: 'Invalid creation data',
          errors: [{
            property: 'captainId',
            description: `The captain must be a student of the team`,
          }],
        }, { cause: error })
      }
      throw error
    }
  }

  @Patch(':id')
  async updateTeam(
    @Param() 
    { id }: TeamPathDto,
    @Body()
    updateData: TeamUpdateDto,
    @Transaction()
    transaction: DbTransaction,
  ): Promise<TeamDto> {
    try {
      const newTeam = await this.teamService.updateTeam(id, updateData, transaction)
      return await buildAndValidateDto(TeamDto, newTeam)
    } catch (error) {
      if (error instanceof TeamNotFoundError) {
        throw new NotFoundException(`There is no team with ID ${id}`, { cause: error })
      }
      if (error instanceof TeacherNotFoundError) {
        throw new BadRequestException({
          message: 'Invalid update data',
          errors: [{
            property: 'teacherInChargeId',
            description: `There is no teacher with ID ${updateData.teacherInChargeId}`,
          }],
        }, { cause: error })
      }
      if (error instanceof InvalidTeacherSchoolError) {
        throw new BadRequestException({
          message: 'Invalid update data',
          errors: [{
            property: 'teacherInChargeId',
            error: `The teacher must be from the school with ID ${error.expectedSchoolId}`,
          }],
        }, { cause: error })
      }
      if (error instanceof StudentNotFoundError) {
        throw new BadRequestException({
          message: 'Invalid update data',
          errors: [{
            property: 'studentIds',
            description: 'There is a non-existent student in the array',
          }],
        }, { cause: error })
      }
      if (error instanceof InvalidStudentSchoolError) {
        throw new BadRequestException({
          message: 'Invalid update data',
          errors: [{
            property: 'studentIds',
            description: `The student with ID ${error.studentId} studies in a different school than the team's one`,
          }],
        }, { cause: error })
      }
      if (error instanceof InvalidCaptainError) {
        throw new BadRequestException('The captain must be a student of the team', { cause: error })
      }
      throw error
    }
  }

  @Delete(':id')
  async deleteTeam(
    @Param() 
    { id }: TeamPathDto,
    @Transaction()
    transaction: DbTransaction,
  ): Promise<void> {
    try {
      await this.teamService.deleteTeam(id, transaction)
    } catch (error) {
      if (error instanceof TeamNotFoundError) {
        throw new NotFoundException(`There is no team with ID ${id}`, { cause: error })
      }
      throw error
    }
  }
}
