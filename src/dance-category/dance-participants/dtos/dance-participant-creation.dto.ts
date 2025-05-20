import { PickType } from '@nestjs/swagger'

import { DanceParticipantDto } from './dance-participant.dto'

export class DanceParticipantCreationDto extends PickType(DanceParticipantDto, ['robotId']) {}