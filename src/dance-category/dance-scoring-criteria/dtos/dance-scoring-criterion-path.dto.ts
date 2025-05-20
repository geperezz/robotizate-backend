import { PickType } from '@nestjs/swagger'

import { DanceScoringCriterionDto } from './dance-scoring-criterion.dto'

export class DanceScoringCriterionPathDto extends PickType(DanceScoringCriterionDto, ['name']) {}