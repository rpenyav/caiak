import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { ConversationsModule } from './conversations/conversations.module';
import { MessagesModule } from './messages/messages.module';
import { OpenaiController } from './openai/openai.controller';
import { OpenaiModule } from './openai/openai.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AppConfigModule } from './config/app-config.module';
import { FileUploadModule } from './file-upload/file-upload.module';
import { SettingsModule } from './settings/settings.module';
import { PromptsModule } from './prompts/prompts.module';
import { LogsModule } from './logs/logs.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),
    AppConfigModule,
    WorkspacesModule,
    ConversationsModule,
    MessagesModule,
    OpenaiModule,
    UsersModule,
    AuthModule,
    FileUploadModule,
    SettingsModule,
    PromptsModule,
    LogsModule,
  ],
  controllers: [AppController, OpenaiController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // No aplicamos LoggerMiddleware globalmente
  }
}
