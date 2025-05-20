import { Module } from '@nestjs/common'

import { DbModule } from 'src/db/db.module'
import { TeacherController } from './teacher.controller'
import { TeacherService } from './teacher.service'

@Module({
  imports: [DbModule],
  controllers: [TeacherController],
  providers: [TeacherService],
})
export class TeacherModule {}
