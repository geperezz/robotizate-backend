import { Module } from '@nestjs/common'

import { DbModule } from 'src/db/db.module'
import { RobotController } from './robot.controller'
import { RobotService } from './robot.service'

@Module({
  imports: [DbModule],
  controllers: [RobotController],
  providers: [RobotService],
})
export class RobotModule {}
