import { PickType } from '@nestjs/swagger'

import { TeamDto } from './team.dto'

export class TeamPathDto extends PickType(TeamDto, ['id']) {}