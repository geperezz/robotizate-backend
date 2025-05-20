import { IsNotEmpty, IsUUID } from 'class-validator'

export class StudentDto {
  @IsUUID()
  id: string

  @IsNotEmpty()
  name: string

  @IsUUID()
  schoolId: string
}