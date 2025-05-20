import { PickType } from '@nestjs/swagger'

import { TeacherDto } from './teacher.dto'

export class TeacherPathDto extends PickType(TeacherDto, ['id']) {}