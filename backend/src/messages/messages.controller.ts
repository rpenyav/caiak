import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Sse,
  Param,
  MessageEvent,
  Get,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { AuthAndLogGuard } from '../common/guards/auth-and-log.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Observable, map, concatMap, tap, from, concat, of } from 'rxjs';

@Controller('messages')
@UseGuards(AuthAndLogGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Sse()
  createHumanMessage(
    @Request() req,
    @Body() createMessageDto: CreateMessageDto,
  ): Observable<MessageEvent> {
    return from(
      this.messagesService.createHumanMessage(req, createMessageDto),
    ).pipe(
      concatMap((humanMessage) =>
        // 1) Emitimos primero el id del mensaje humano
        concat(
          of({
            data: { humanMessageId: humanMessage._id, kind: 'human_saved' },
          } as MessageEvent),
          // 2) Stream de respuesta del bot
          from(
            this.messagesService.generateBotResponse(
              humanMessage.conversationId,
            ),
          ).pipe(
            concatMap(
              (
                stream: Observable<{ content: string; suggestTicket: boolean }>,
              ) => {
                let fullResponse = '';
                // emitimos SOLO chunks; el DONE va fuera
                return stream.pipe(
                  map(({ content, suggestTicket }) => {
                    fullResponse += content;
                    return {
                      data: { content, suggestTicket },
                    } as MessageEvent;
                  }),
                  tap({
                    complete: () => {
                      const suggestTicket = /crea un ticket|TICKET-\d{4}/.test(
                        fullResponse,
                      );
                      this.messagesService.saveBotMessage(
                        humanMessage.conversationId,
                        fullResponse,
                        humanMessage.userId,
                        suggestTicket,
                      );
                    },
                  }),
                );
              },
            ),
          ),
          // 3) ÚNICO [DONE] al final de todo
          of({ data: '[DONE]' } as MessageEvent),
        ),
      ),
    );
  }

  @Sse(':conversationId/bot')
  @UseGuards(RolesGuard)
  botResponseStream(
    @Param('conversationId') conversationId: string,
  ): Observable<MessageEvent> {
    let fullResponse = '';
    return concat(
      from(this.messagesService.generateBotResponse(conversationId)).pipe(
        concatMap(
          (stream: Observable<{ content: string; suggestTicket: boolean }>) =>
            stream.pipe(
              map(({ content, suggestTicket }) => {
                fullResponse += content;
                return { data: { content, suggestTicket } } as MessageEvent;
              }),
              tap({
                complete: () => {
                  const suggestTicket = /crea un ticket|TICKET-\d{4}/.test(
                    fullResponse,
                  );
                  this.messagesService.saveBotMessage(
                    conversationId,
                    fullResponse,
                    'bot',
                    suggestTicket,
                  );
                },
              }),
            ),
        ),
      ),
      of({ data: '[DONE]' } as MessageEvent),
    );
  }

  @Get(':conversationId')
  async getMessagesByConversation(
    @Param('conversationId') conversationId: string,
    @Request() req,
  ) {
    return this.messagesService.getMessagesByConversation(
      conversationId,
      req.user,
    );
  }
}
