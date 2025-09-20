import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { AppConfigService } from './app-config.service';

@Module({
  imports: [NestConfigModule],
  providers: [AppConfigService],
  exports: [AppConfigService],
})
export class AppConfigModule {}
