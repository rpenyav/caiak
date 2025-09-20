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
import { Observable, from, tap, map } from 'rxjs';
import OpenAI from 'openai';
import { LogsService } from '../logs/logs.service';
import { PromptsService } from '../prompts/prompts.service';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message.name) private readonly messageModel: Model<Message>,
    private readonly conversationsService: ConversationsService,
    private readonly openaiService: OpenaiService,
    private readonly appConfigService: AppConfigService,
    private readonly logsService: LogsService,
    private readonly promptsService: PromptsService,
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
      fileUrls: createMessageDto.fileUrls,
    });
    const savedMessage = await message.save();

    // Obtener el prompt usado
    let promptUsed = 'prompt de pruebas';
    try {
      const promptDoc = await this.promptsService.findFirstPrompt();
      promptUsed = promptDoc.prompt;
    } catch (error) {
      // Usar prompt por defecto si no se encuentra
    }

    // Loguear interacción humana
    await this.logsService.createLog(
      'interaction',
      userId,
      req.user?.appId || 'caiak-app-1',
      req.ip || 'unknown',
      req.get('user-agent') || '',
      {
        conversationId: createMessageDto.conversationId,
        messageType: createMessageDto.type,
        content: createMessageDto.content,
        fileUrls: createMessageDto.fileUrls,
        promptUsed,
      },
      'info',
    );

    return savedMessage;
  }

  generateBotResponse(
    conversationId: string,
  ): Promise<Observable<{ content: string; suggestTicket: boolean }>> {
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

        // Obtener el userId del mensaje humano más reciente
        const lastHumanMessage = messages.find((msg) => msg.sender === 'human');
        const userId = lastHumanMessage ? lastHumanMessage.userId : 'bot';

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

        // Obtener el prompt usado
        let promptUsed = 'prompt de pruebas';
        try {
          const promptDoc = await this.promptsService.findFirstPrompt();
          promptUsed = promptDoc.prompt;
        } catch (error) {
          // Usar prompt por defecto si no se encuentra
        }

        const startTime = Date.now();
        const stream =
          await this.openaiService.generateStreamResponse(formattedMessages);

        // Loguear interacción del bot
        let fullResponse = '';
        return stream.pipe(
          tap({
            next: (chunk: string) => {
              fullResponse += chunk;
            },
            complete: async () => {
              const responseTime = Date.now() - startTime;
              const suggestTicket = /crea un ticket|TICKET-\d{4}/.test(
                fullResponse,
              );
              await this.logsService.createLog(
                'interaction',
                userId,
                'caiak-app-1',
                'bot-ip',
                'bot-agent',
                {
                  conversationId,
                  messageType: 'text',
                  content: fullResponse,
                  promptUsed,
                  responseTime,
                  suggestTicket,
                },
                'info',
              );
              // Guardar mensaje del bot con suggestTicket
              await this.saveBotMessage(
                conversationId,
                fullResponse,
                userId,
                suggestTicket,
              );
            },
          }),
          map((chunk: string) => {
            const suggestTicket = /crea un ticket|TICKET-\d{4}/.test(
              fullResponse + chunk,
            );
            return { content: chunk, suggestTicket };
          }),
        );
      });
  }

  async saveBotMessage(
    conversationId: string,
    content: string,
    userId: string,
    suggestTicket: boolean = false,
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
      suggestTicket,
    });
    const savedMessage = await message.save();

    // Obtener el prompt usado
    let promptUsed = 'prompt de pruebas';
    try {
      const promptDoc = await this.promptsService.findFirstPrompt();
      promptUsed = promptDoc.prompt;
    } catch (error) {
      // Usar prompt por defecto si no se encuentra
    }

    // Loguear interacción del bot
    await this.logsService.createLog(
      'interaction',
      userId,
      'caiak-app-1',
      'bot-ip',
      'bot-agent',
      {
        conversationId,
        messageType: 'text',
        content,
        promptUsed,
        suggestTicket,
      },
      'info',
    );

    return savedMessage;
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
