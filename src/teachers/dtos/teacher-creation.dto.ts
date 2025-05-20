import { IntersectionType, OmitType, PartialType, PickType } from '@nestjs/swagger'

import { TeacherDto } from './teacher.dto'

export class TeacherCreationDto extends IntersectionType(
  PartialType(PickType(TeacherDto, ['id'])),
  OmitType(TeacherDto, ['id'])
) {}