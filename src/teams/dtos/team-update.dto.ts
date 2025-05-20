import { OmitType, PartialType } from '@nestjs/swagger'
import { ArrayNotEmpty, IsOptional, IsUUID } from 'class-validator'

import { TeamDto } from './team.dto'

export class TeamUpdateDto extends PartialType(
  OmitType(TeamDto, ['students', 'teacherInCharge', 'schoolId'])
) {
  @IsUUID('all', { each: true })
  @ArrayNotEmpty()
  @IsOptional()
  studentIds: string[] | undefined

  @IsUUID()
  @IsOptional()
  teacherInChargeId: string | undefined
}