import { PickType } from '@nestjs/swagger'

import { SchoolDto } from './school.dto'

export class SchoolPathDto extends PickType(SchoolDto, ['id']) {}