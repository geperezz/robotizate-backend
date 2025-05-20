import { OmitType } from '@nestjs/swagger'
import { IsInt, IsNotEmpty, IsUUID, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

import { RobotDto } from 'src/robots/dtos'

export class DanceCriterionScoreDto {
  @IsNotEmpty()
  criterion: string

  @IsInt()
  score: number
}

export class DanceParticipantDto extends OmitType(RobotDto, ['id']) {
  @IsUUID()
  robotId: string

  @IsInt()
  rank: number

  @IsInt()
  totalScore: number

  @Type(() => DanceCriterionScoreDto)
  @ValidateNested()
  scorePerCriterion: DanceCriterionScoreDto[]
}