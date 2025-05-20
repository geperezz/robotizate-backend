import { IsIn, IsInt, IsNotEmpty, IsUUID, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

export class DanceCriterionScoreDto {
  @IsNotEmpty()
  criterion: string

  @IsInt()
  score: number
}

export class DancePresentationDto {
  @IsUUID()
  robotId: string

  @IsIn(['Reguetón', 'Calipso', 'Joropo'])
  genre: 'Reguetón' | 'Calipso' | 'Joropo'

  @Type(() => DanceCriterionScoreDto)
  @ValidateNested()
  scorePerCriterion: DanceCriterionScoreDto[]
}