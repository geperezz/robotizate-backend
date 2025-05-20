import { PickType } from '@nestjs/swagger'

import { DancePresentationDto } from './dance-presentation.dto'

export class DanceParticipantPathDto extends PickType(DancePresentationDto, ['robotId']) {}