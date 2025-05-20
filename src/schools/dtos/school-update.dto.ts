import { PartialType } from '@nestjs/swagger'

import { SchoolDto } from './school.dto'

export class SchoolUpdateDto extends PartialType(SchoolDto) {}