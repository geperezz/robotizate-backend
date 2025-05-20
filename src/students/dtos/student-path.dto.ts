import { PickType } from '@nestjs/swagger'

import { StudentDto } from './student.dto'

export class StudentPathDto extends PickType(StudentDto, ['id']) {}