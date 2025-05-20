import { BadRequestException, Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post } from '@nestjs/common'

import { CriterionNotFoundError, DanceParticipantNotFoundError, DancePresentationAlreadyExistsError, DancePresentationNotFoundError, DancePresentationService, ScoreOutOfRangeError  } from './dance-presentation.service'
import { DbTransaction, Transaction } from 'src/db/db.transactions'
import { buildAndValidateDto } from 'src/common/dto-validation'
import { DanceParticipantPathDto, DancePresentationCreationDto, DancePresentationDto, DancePresentationPathDto } from './dtos'

@Controller('categories/dance/participants/:robotId/presentations')
export class DancePresentationController {
  constructor(
    private readonly dancePresentationService: DancePresentationService,
  ) {}

  @Get()
  async getPresentations(
    @Param()
    { robotId }: DanceParticipantPathDto,
    @Transaction()
    transaction: DbTransaction,
  ): Promise<DancePresentationDto[]> {
    const presentations = await this.dancePresentationService.getPresentations(robotId, transaction)
    return Promise.all(
      presentations.map(p => buildAndValidateDto(DancePresentationDto, p))
    )
  }

  @Post()
  async createPresentation(
    @Param()
    { robotId }: DanceParticipantPathDto,
    @Body()
    creationData: DancePresentationCreationDto,
    @Transaction()
    transaction: DbTransaction,
  ): Promise<DancePresentationDto> {
    try {
      const presentation = await this.dancePresentationService.createPresentation(robotId, creationData, transaction)
      return await buildAndValidateDto(DancePresentationDto, presentation)
    } catch (error) {
      if (error instanceof DanceParticipantNotFoundError) {
        throw new NotFoundException(
          `There is no dance participant with ID ${robotId}`,
          { cause: error },
        )
      }
      if (error instanceof DancePresentationAlreadyExistsError) {
        throw new BadRequestException(
          `There already exists a ${creationData.genre} presentation for the participant with ID ${robotId}`,
          { cause: error }
        )
      }
      if (error instanceof ScoreOutOfRangeError) {
        throw new BadRequestException({
          message: 'Invalid creation data',
          errors: [{
            property: 'scorePerCriterion[].score',
            error: `The score provided for the ${error.criterion} criterion is out of range. `
              + `It should be between ${error.minScore} and ${error.maxScore}`,
          }],
        }, { cause: error })
      }
      if (error instanceof CriterionNotFoundError) {
        throw new BadRequestException({
          message: 'Invalid creation data',
          errors: [{
            property: 'scorePerCriterion[].criterion',
            error: 'There is a non-existent criterion in the provided scores',
          }],
        }, { cause: error })
      }
      throw error
    }
  }

  @Patch(':genre')
  async updatePresentation(
    @Param()
    { robotId, genre }: DancePresentationPathDto,
    @Body()
    updateData: DancePresentationCreationDto,
    @Transaction()
    transaction: DbTransaction,
  ): Promise<DancePresentationDto> {
    try {
      const newPresentation = await this.dancePresentationService.updatePresentation(
        robotId,
        genre,
        updateData,
        transaction
      )
      return await buildAndValidateDto(DancePresentationDto, newPresentation)
    } catch (error) {
      if (error instanceof DancePresentationNotFoundError) {
        throw new NotFoundException(
          `There is no ${genre} presentation for the participant with ID ${robotId}`,
          { cause: error },
        )
      }
      if (error instanceof ScoreOutOfRangeError) {
        throw new BadRequestException({
          message: 'Invalid creation data',
          errors: [{
            property: 'scorePerCriterion[].score',
            error: `The score provided for the ${error.criterion} criterion is out of range. `
              + `It should be between ${error.minScore} and ${error.maxScore}`,
          }],
        }, { cause: error })
      }
      if (error instanceof CriterionNotFoundError) {
        throw new BadRequestException({
          message: 'Invalid creation data',
          errors: [{
            property: 'scorePerCriterion[].criterion',
            error: 'There is a non-existent criterion in the provided scores',
          }],
        }, { cause: error })
      }
      throw error
    }
  }

  @Delete(':genre')
  async deleteParticipant(
    @Param()
    { robotId, genre }: DancePresentationPathDto,
    @Transaction()
    transaction: DbTransaction,
  ): Promise<void> {
    try {
      await this.dancePresentationService.deletePresentation(robotId, genre, transaction)
    } catch (error) {
      if (error instanceof DancePresentationNotFoundError) {
        throw new NotFoundException(
          `There is no ${genre} presentation for the participant with ID ${robotId}`,
          { cause: error },
        )
      }
      throw error
    }
  }
}