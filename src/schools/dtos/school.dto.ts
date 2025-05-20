import { IsBase64, IsNotEmpty, IsUUID } from 'class-validator'

export class SchoolDto {
  @IsUUID()
  id: string

  @IsNotEmpty()
  name: string

  @IsBase64()
  logo: string
}