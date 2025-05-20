import { BadRequestException, Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post } from '@nestjs/common'

import { DbTransaction, Transaction } from 'src/db/db.transactions'
import { buildAndValidateDto } from 'src/common/dto-validation'
import { DanceScoringCriterionNotFoundError, DanceScoringCriterionService } from './dance-scoring-criterion.service'
import { DanceScoringCriterionCreationDto, DanceScoringCriterionDto, DanceScoringCriterionPathDto, DanceScoringCriterionUpdateDto } from './dtos'

@Controller('categories/dance/scoring-criteria')
export class DanceScoringCriterionController {
  constructor(
    private readonly danceScoringCriterionService: DanceScoringCriterionService,
  ) {}

  @Get()
  async getCriteria(
    @Transaction()
    transaction: DbTransaction,
  ): Promise<DanceScoringCriterionDto[]> {
    const criteria = await this.danceScoringCriterionService.getCriteria(transaction)
    return await Promise.all(
      criteria.map(c => buildAndValidateDto(DanceScoringCriterionDto, c))
    )
  }

  @Get(':name')
  async getCriterion(
    @Param()
    { name }: DanceScoringCriterionPathDto,
    @Transaction()
    transaction: DbTransaction,
  ): Promise<DanceScoringCriterionDto> {
    const criterion = await this.danceScoringCriterionService.getCriterion(name, transaction)
    if (!criterion) {
      throw new NotFoundException(`There is no criterion named ${name}`)
    }
    return await buildAndValidateDto(DanceScoringCriterionDto, criterion)
  }

  @Post()
  async createCriterion(
    @Body()
    creationData: DanceScoringCriterionCreationDto,
    @Transaction()
    transaction: DbTransaction,
  ): Promise<DanceScoringCriterionDto> {
    const newCriterion = await this.danceScoringCriterionService.createCriterion(creationData, transaction)
    return await buildAndValidateDto(DanceScoringCriterionDto, newCriterion)
  }

  @Patch(':name')
  async updateCriterion(
    @Param()
    { name }: DanceScoringCriterionPathDto,
    @Body()
    updateData: DanceScoringCriterionUpdateDto,
    @Transaction()
    transaction: DbTransaction,
  ): Promise<DanceScoringCriterionDto> {
    try {
      const newCriterion = await this.danceScoringCriterionService.updateCriterion(name, updateData, transaction)
      return buildAndValidateDto(DanceScoringCriterionDto, newCriterion)
    } catch (error) {
      if (error instanceof DanceScoringCriterionNotFoundError) {
        throw new NotFoundException(
          `There is no criterion named ${name}`,
          { cause: error },
        )
      }
      throw error
    }
  }

  @Delete(':name')
  async deleteCriterion(
    @Param()
    { name }: DanceScoringCriterionPathDto,
    @Transaction()
    transaction: DbTransaction,
  ): Promise<void> {
    try {
      await this.danceScoringCriterionService.deleteCriterion(name, transaction)
    } catch (error) {
      if (error instanceof DanceScoringCriterionNotFoundError) {
        throw new NotFoundException(
          `There is no criterion named ${name}`,
          { cause: error },
        )
      }
      throw error
    }
  }
}