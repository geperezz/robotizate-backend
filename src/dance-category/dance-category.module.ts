import { Module } from '@nestjs/common'

import { DbModule } from 'src/db/db.module'
import { DanceParticipantController } from './dance-participants/dance-participant.controller'
import { DanceParticipantService } from './dance-participants/dance-participant.service'
import { DanceScoringCriterionController } from './dance-scoring-criteria/dance-scoring-criterion.controller'
import { DanceScoringCriterionService } from './dance-scoring-criteria/dance-scoring-criterion.service'
import { DancePresentationController } from './dance-presentations/dance-presentation.controller'
import { DancePresentationService } from './dance-presentations/dance-presentation.service'

@Module({
  imports: [DbModule],
  controllers: [
    DanceParticipantController,
    DanceScoringCriterionController,
    DancePresentationController,
  ],
  providers: [
    DanceParticipantService,
    DanceScoringCriterionService,
    DancePresentationService,
  ],
})
export class DanceCategoryModule {}
