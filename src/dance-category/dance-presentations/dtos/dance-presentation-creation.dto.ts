import { OmitType } from '@nestjs/swagger'

import { DancePresentationDto } from './dance-presentation.dto'

export class DancePresentationCreationDto extends OmitType(DancePresentationDto, ['robotId']) {}