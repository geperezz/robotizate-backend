import { BadRequestException, Body, Controller, Delete, Get, NotFoundException, Param, Post } from '@nestjs/common'

import { DanceParticipantNotFoundError, DanceParticipantService, RobotNotFoundError } from './dance-participant.service'
import { DbTransaction, Transaction } from 'src/db/db.transactions'
import { buildAndValidateDto } from 'src/common/dto-validation'
import { DanceParticipantCreationDto, DanceParticipantDto, DanceParticipantPathDto } from './dtos'

@Controller('categories/dance')
export class DanceParticipantController {
  constructor(
    private readonly danceParticipantService: DanceParticipantService,
  ) {}

  @Get('participants')
  async getParticipants(
    @Transaction()
    transaction: DbTransaction,
  ): Promise<DanceParticipantDto[]> {
    const participants = await this.danceParticipantService.getParticipants(transaction)
    return Promise.all(
      participants.map(p => buildAndValidateDto(DanceParticipantDto, p))
    )
  }

  @Post('participants')
  async createParticipant(
    @Body()
    creationData: DanceParticipantCreationDto,
    @Transaction()
    transaction: DbTransaction,
  ): Promise<DanceParticipantDto> {
    try {
      return await this.danceParticipantService.createParticipant(creationData, transaction)
    } catch (error) {
      if (error instanceof RobotNotFoundError) {
        throw new BadRequestException({
          message: 'Invalid creation data',
          errors: [{
            property: 'robotId',
            error: `There is no robot with ID ${creationData.robotId}`,
          }],
        }, { cause: error })
      }
      throw error
    }
  }

  @Delete('participants/:robotId')
  async deleteParticipant(
    @Param()
    { robotId }: DanceParticipantPathDto,
    @Transaction()
    transaction: DbTransaction,
  ): Promise<void> {
    try {
      await this.danceParticipantService.deleteParticipant(robotId, transaction)
    } catch (error) {
      if (error instanceof DanceParticipantNotFoundError) {
        throw new NotFoundException(
          `There is no robot with ID ${robotId}`,
          { cause: error },
        )
      }
      throw error
    }
  }
}