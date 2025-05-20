import { Type } from 'class-transformer'
import { ArrayNotEmpty, IsNotEmpty, IsUUID, ValidateNested } from 'class-validator'

export class TeamStudentDto {
  @IsUUID()
  id: string

  @IsNotEmpty()
  name: string
}

export class TeamTeacherDto {
  @IsUUID()
  id: string

  @IsNotEmpty()
  name: string
}

export class TeamDto {
  @IsUUID()
  id: string

  @IsNotEmpty()
  name: string

  @IsUUID()
  schoolId: string

  @Type(() => TeamStudentDto)
  @ValidateNested()
  @ArrayNotEmpty()
  students: TeamStudentDto[]
  
  @IsUUID()
  captainId: string

  @Type(() => TeamTeacherDto)
  @ValidateNested()
  teacherInCharge: TeamTeacherDto
}