import { IsBase64, IsNotEmpty, IsUUID } from 'class-validator'

export class RobotDto {
  @IsUUID()
  id: string

  @IsNotEmpty()
  name: string

  @IsUUID()
  teamId: string

  @IsBase64()
  picture: string
}