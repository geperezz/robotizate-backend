import { BadRequestException, Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post } from '@nestjs/common'

import { RobotNotFoundError, RobotService, TeamNotFoundError } from './robot.service'
import { Transaction } from 'src/db/db.transactions'
import { DbTransaction } from 'src/db/db.transactions'
import { buildAndValidateDto } from 'src/common/dto-validation'
import { RobotCreationDto, RobotDto, RobotPathDto, RobotUpdateDto } from './dtos'

@Controller('robots')
export class RobotController {
  constructor(private readonly robotService: RobotService) {}

  @Get(':id')
  async getRobot(
    @Param()
    { id }: RobotPathDto,
    @Transaction()
    transaction: DbTransaction,
  ): Promise<RobotDto> {
    const robot = await this.robotService.getRobot(id, transaction)
    if (!robot) {
      throw new NotFoundException(`There is no robot with ID ${id}`)
    }
    return await buildAndValidateDto(RobotDto, robot)
  }

  @Get()
  async getRobots(
    @Transaction()
    transaction: DbTransaction,
  ): Promise<RobotDto[]> {
    const robots = await this.robotService.getRobots(transaction)
    return Promise.all(
      robots.map(s => buildAndValidateDto(RobotDto, s))
    )
  }

  @Post()
  async createRobot(
    @Body()
    creationData: RobotCreationDto,
    @Transaction()
    transaction: DbTransaction,
  ): Promise<RobotDto> {
    try {
      const newRobot = await this.robotService.createRobot(creationData, transaction)
      return await buildAndValidateDto(RobotDto, newRobot)
    } catch (error) {
      if (error instanceof TeamNotFoundError) {
        throw new BadRequestException({
          message: 'Invalid creation data',
          errors: [{
            property: 'teamId',
            description: `There is no team with ID ${creationData.teamId}`,
          }],
        }, { cause: error })
      }
      throw error
    }
  }

  @Patch(':id')
  async updateRobot(
    @Param() 
    { id }: RobotPathDto,
    @Body()
    updateData: RobotUpdateDto,
    @Transaction()
    transaction: DbTransaction,
  ): Promise<RobotDto> {
    try {
      const newRobot = await this.robotService.updateRobot(id, updateData, transaction)
      return await buildAndValidateDto(RobotDto, newRobot)
    } catch (error) {
      if (error instanceof RobotNotFoundError) {
        throw new NotFoundException(`There is no robot with ID ${id}`, { cause: error })
      }
      if (error instanceof TeamNotFoundError) {
        throw new BadRequestException({
          message: 'Invalid update data',
          errors: [{
            property: 'teamId',
            description: `There is no team with ID ${updateData.teamId}`,
          }],
        }, { cause: error })
      }
      throw error
    }
  }

  @Delete(':id')
  async deleteRobot(
    @Param() 
    { id }: RobotPathDto,
    @Transaction()
    transaction: DbTransaction,
  ): Promise<void> {
    try {
      await this.robotService.deleteRobot(id, transaction)
    } catch (error) {
      if (error instanceof RobotNotFoundError) {
        throw new NotFoundException(`There is no robot with ID ${id}`, { cause: error })
      }
      throw error
    }
  }
}
