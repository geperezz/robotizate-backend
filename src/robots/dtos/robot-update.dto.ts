import { PartialType } from '@nestjs/swagger'

import { RobotDto } from './robot.dto'

export class RobotUpdateDto extends PartialType(RobotDto) {}