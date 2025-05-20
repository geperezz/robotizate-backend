import { IntersectionType, OmitType, PartialType, PickType } from '@nestjs/swagger'

import { SchoolDto } from './school.dto'

export class SchoolCreationDto extends IntersectionType(
  PartialType(PickType(SchoolDto, ['id'])),
  OmitType(SchoolDto, ['id'])
) {}