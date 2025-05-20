import { PickType } from '@nestjs/swagger'

import { RobotDto } from './robot.dto'

export class RobotPathDto extends PickType(RobotDto, ['id']) {}