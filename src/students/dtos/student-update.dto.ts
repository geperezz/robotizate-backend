import { PartialType } from '@nestjs/swagger'

import { StudentDto } from './student.dto'

export class StudentUpdateDto extends PartialType(StudentDto) {}