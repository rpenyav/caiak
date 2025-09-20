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
import { Observable, map, concatMap, tap, from } from 'rxjs';

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
        from(
          this.messagesService.generateBotResponse(humanMessage.conversationId),
        ).pipe(
          concatMap((stream: Observable<string>) => {
            let fullResponse = '';
            return stream.pipe(
              map((chunk: string) => {
                fullResponse += chunk;
                return { data: chunk } as MessageEvent;
              }),
              tap({
                complete: () => {
                  this.messagesService.saveBotMessage(
                    humanMessage.conversationId,
                    fullResponse,
                    humanMessage.userId,
                  );
                },
              }),
              concatMap((event) =>
                from([event, { data: '[DONE]' } as MessageEvent]),
              ),
            );
          }),
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
    return from(this.messagesService.generateBotResponse(conversationId)).pipe(
      concatMap((stream: Observable<string>) =>
        stream.pipe(
          map((chunk: string) => {
            fullResponse += chunk;
            return { data: chunk } as MessageEvent;
          }),
          tap({
            complete: () => {
              this.messagesService.saveBotMessage(
                conversationId,
                fullResponse,
                'bot',
              );
            },
          }),
          concatMap((event) =>
            from([event, { data: '[DONE]' } as MessageEvent]),
          ),
        ),
      ),
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
