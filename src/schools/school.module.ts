import { Module } from '@nestjs/common'

import { DbModule } from 'src/db/db.module'
import { SchoolController } from './school.controller'
import { SchoolService } from './school.service'

@Module({
  imports: [DbModule],
  controllers: [SchoolController],
  providers: [SchoolService],
})
export class SchoolModule {}
