import { Module } from '@nestjs/common'
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core'

import { DbModule } from './db/db.module'
import { SchoolModule } from './schools/school.module'
import { StudentModule } from './students/student.module'
import { TeamModule } from './teams/team.module'
import { TeacherModule } from './teachers/teacher.module'
import { RobotModule } from './robots/robot.module'
import { TransactionInterceptor } from './db/db.transactions'
import { buildValidationPipe } from './common/dto-validation'
import { ExceptionFormatterFilter, ResponseFormatterInterceptor } from './common/response-formatting'
import { DanceCategoryModule } from './dance-category/dance-category.module'

@Module({
  imports: [
    DbModule,
    SchoolModule,
    StudentModule,
    TeacherModule,
    TeamModule,
    RobotModule,
    DanceCategoryModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: TransactionInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseFormatterInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: ExceptionFormatterFilter,
    },
    {
      provide: APP_PIPE,
      useValue: buildValidationPipe()
    },
  ],
})
export class AppModule {}
