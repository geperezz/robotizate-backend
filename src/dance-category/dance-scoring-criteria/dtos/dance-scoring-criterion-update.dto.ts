import { PartialType } from '@nestjs/swagger'

import { DanceScoringCriterionCreationDto } from './dance-scoring-criterion-creation.dto'

export class DanceScoringCriterionUpdateDto extends PartialType(DanceScoringCriterionCreationDto) {}