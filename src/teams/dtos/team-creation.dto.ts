import { IntersectionType, OmitType, PartialType, PickType } from '@nestjs/swagger'
import { ArrayNotEmpty, IsUUID } from 'class-validator'

import { TeamDto } from './team.dto'

export class TeamCreationDto extends IntersectionType(
  PartialType(PickType(TeamDto, ['id'])),
  OmitType(TeamDto, ['id', 'students', 'teacherInCharge'])
) {
  @IsUUID('all', { each: true })
  @ArrayNotEmpty()
  studentIds: string[]

  @IsUUID()
  teacherInChargeId: string
}