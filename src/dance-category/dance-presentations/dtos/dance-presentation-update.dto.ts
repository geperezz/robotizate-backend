import { PickType } from '@nestjs/swagger'

import { DancePresentationDto } from './dance-presentation.dto'

export class DancePresentationUpdateDto extends PickType(DancePresentationDto, ['scorePerCriterion']) {}