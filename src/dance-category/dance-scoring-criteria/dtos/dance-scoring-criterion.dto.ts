import { IsInt, IsNotEmpty } from 'class-validator'

export class DanceScoringCriterionDto {
  @IsNotEmpty()
  name: string

  @IsInt()
  minScore: number

  @IsInt()
  maxScore: number
}