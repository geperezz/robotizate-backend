import { PartialType } from '@nestjs/swagger'

import { TeacherDto } from './teacher.dto'

export class TeacherUpdateDto extends PartialType(TeacherDto) {}