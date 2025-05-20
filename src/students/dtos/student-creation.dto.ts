import { IntersectionType, OmitType, PartialType, PickType } from '@nestjs/swagger'

import { StudentDto } from './student.dto'

export class StudentCreationDto extends IntersectionType(
  PartialType(PickType(StudentDto, ['id'])),
  OmitType(StudentDto, ['id'])
) {}