import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from './messages.schema';
import { ConversationsService } from '../conversations/conversations.service';
import { OpenaiService } from '../openai/openai.service';
import { AppConfigService } from '../config/app-config.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { Observable, from } from 'rxjs';
import OpenAI from 'openai';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message.name) private readonly messageModel: Model<Message>,
    private readonly conversationsService: ConversationsService,
    private readonly openaiService: OpenaiService,
    private readonly appConfigService: AppConfigService,
  ) {}

  async createHumanMessage(req: any, createMessageDto: CreateMessageDto) {
    const conversation = await this.conversationsService.findById(
      createMessageDto.conversationId,
    );
    if (!conversation) {
      throw new NotFoundException(
        `Conversación con ID "${createMessageDto.conversationId}" no encontrada`,
      );
    }

    const userId = req.user?.sub || req.user?.id;
    if (!userId) {
      throw new NotFoundException(
        'ID de usuario no encontrado en el token JWT',
      );
    }

    const workspaceSlug =
      createMessageDto.workspaceSlug || conversation.workspaceSlug;
    if (!workspaceSlug) {
      throw new NotFoundException('workspaceSlug no está disponible');
    }

    const message = new this.messageModel({
      conversationId: createMessageDto.conversationId,
      content: createMessageDto.content || '',
      userId,
      workspaceSlug,
      sender: 'human',
      type: createMessageDto.type || 'text',
      createdAt: new Date(),
      fileUrls: createMessageDto.fileUrls, // Guardar array de URLs
    });
    return message.save();
  }

  generateBotResponse(conversationId: string): Promise<Observable<string>> {
    return this.conversationsService
      .findById(conversationId)
      .then(async (conversation) => {
        if (!conversation) {
          throw new NotFoundException(
            `Conversación con ID "${conversationId}" no encontrada`,
          );
        }

        const messages = await this.messageModel
          .find({ conversationId })
          .sort({ createdAt: 1 })
          .exec();

        const formattedMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] =
          messages.map((msg) => {
            if (msg.type === 'file' && msg.fileUrls?.length) {
              const contentArray: any[] = [
                {
                  type: 'text' as const,
                  text: msg.content || 'Archivos recibidos',
                },
                ...msg.fileUrls.map((url) => ({
                  type: 'image_url' as const,
                  image_url: { url },
                })),
              ];
              return {
                role: 'user' as const,
                content: contentArray,
              };
            }
            return {
              role:
                msg.sender === 'human'
                  ? ('user' as const)
                  : ('assistant' as const),
              content: msg.content,
            };
          });

        return this.openaiService.generateStreamResponse(formattedMessages);
      });
  }

  async saveBotMessage(
    conversationId: string,
    content: string,
    userId: string,
  ) {
    const conversation =
      await this.conversationsService.findById(conversationId);
    if (!conversation) {
      throw new NotFoundException(
        `Conversación con ID "${conversationId}" no encontrada`,
      );
    }

    const message = new this.messageModel({
      conversationId,
      content,
      sender: 'bot',
      userId,
      workspaceSlug: conversation.workspaceSlug,
      type: 'text',
      createdAt: new Date(),
    });
    return message.save();
  }

  async getMessagesByConversation(conversationId: string, user: any) {
    const conversation =
      await this.conversationsService.findById(conversationId);
    if (!conversation) {
      throw new NotFoundException(
        `Conversación con ID "${conversationId}" no encontrada`,
      );
    }

    if (!user || !user.roles) {
      throw new ForbiddenException('Usuario no autenticado o sin roles');
    }

    if (conversation.workspaceSlug) {
      const hasRole = user.roles.some((role: string) =>
        conversation.roles.includes(role),
      );
      if (!hasRole) {
        throw new ForbiddenException(
          `Usuario no tiene permisos para el workspace "${conversation.workspaceSlug}"`,
        );
      }
    }

    return this.messageModel
      .find({ conversationId })
      .sort({ createdAt: 1 })
      .exec();
  }
}
