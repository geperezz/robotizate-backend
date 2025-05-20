import { IntersectionType, OmitType, PartialType, PickType } from '@nestjs/swagger'

import { RobotDto } from './robot.dto'

export class RobotCreationDto extends IntersectionType(
  PartialType(PickType(RobotDto, ['id'])),
  OmitType(RobotDto, ['id'])
) {}