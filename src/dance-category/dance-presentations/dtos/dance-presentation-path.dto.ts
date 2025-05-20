import { OmitType } from '@nestjs/swagger'

import { DancePresentationDto } from './dance-presentation.dto'

export class DancePresentationPathDto extends OmitType(DancePresentationDto, ['scorePerCriterion']) {}