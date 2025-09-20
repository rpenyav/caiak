import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConversationsService } from './conversations.service';
import { ConversationsController } from './conversations.controller';
import { Conversation, ConversationSchema } from './conversations.schema';
import { WorkspacesModule } from '../workspaces/workspaces.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Conversation.name, schema: ConversationSchema },
    ]),
    forwardRef(() => WorkspacesModule),
  ],
  controllers: [ConversationsController], // Asegurar que el controlador esté registrado
  providers: [ConversationsService],
  exports: [
    ConversationsService,
    MongooseModule.forFeature([
      { name: Conversation.name, schema: ConversationSchema },
    ]),
  ],
})
export class ConversationsModule {}
