import { PickType } from '@nestjs/swagger'

import { DanceParticipantDto } from './dance-participant.dto'

export class DanceParticipantPathDto extends PickType(DanceParticipantDto, ['robotId']) {}