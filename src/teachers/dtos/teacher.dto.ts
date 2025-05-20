import { IsNotEmpty, IsUUID } from 'class-validator'

export class TeacherDto {
  @IsUUID()
  id: string

  @IsNotEmpty()
  name: string

  @IsUUID()
  schoolId: string
}