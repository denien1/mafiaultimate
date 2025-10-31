import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { StripeWebhookController } from './stripe.webhook.controller';
import { SimController } from './modules/tools/sim.controller';
import { EditorController } from './modules/editor/editor.controller';
import { MetricsController } from './metrics.controller';
import { LiveOpsModule } from './modules/liveops/liveops.module';
import { LiveOpsEditorController } from './modules/liveops/editor.controller';
import { AdminGuard } from './rbac';
import { AntiBotController } from './antibot.controller';
import { DbModule } from './db.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { StatsModule } from './modules/stats/stats.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { PropertiesModule } from './modules/properties/properties.module';
import { PvPModule } from './modules/pvp/pvp.module';
import { StoreModule } from './modules/store/store.module';
import { ClansModule } from './modules/clans/clans.module';
import { GqlModule } from './graphql.module';

@Module({
  imports: [DbModule, AuthModule, UsersModule, StatsModule, JobsModule, PropertiesModule, PvPModule, StoreModule, ClansModule, LiveOpsModule, GqlModule],
  controllers: [HealthController, MetricsController, StripeWebhookController, AntiBotController, LiveOpsEditorController, SimController, EditorController],
})
export class AppModule {}

