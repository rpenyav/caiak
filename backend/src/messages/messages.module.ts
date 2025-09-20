import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { Message, MessageSchema } from './messages.schema';
import { ConversationsModule } from '../conversations/conversations.module';
import { AuthModule } from '../auth/auth.module';
import { OpenaiModule } from '../openai/openai.module';
import { AppConfigModule } from '../config/app-config.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { FileUploadModule } from '../file-upload/file-upload.module';
import { LogsModule } from '../logs/logs.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
    forwardRef(() => ConversationsModule),
    forwardRef(() => AuthModule),
    OpenaiModule,
    AppConfigModule,
    WorkspacesModule,
    FileUploadModule,
    LogsModule, // Añadido para proporcionar LogsService
  ],
  controllers: [MessagesController],
  providers: [MessagesService],
  exports: [MessagesService],
})
export class MessagesModule {}
