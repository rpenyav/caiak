import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OpenaiService } from './openai.service';
import { OpenaiController } from './openai.controller';
import { PromptsModule } from '../prompts/prompts.module';

@Module({
  imports: [ConfigModule, forwardRef(() => PromptsModule)],
  providers: [OpenaiService],
  controllers: [OpenaiController],
  exports: [OpenaiService],
})
export class OpenaiModule {}
