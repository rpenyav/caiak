import { MessageRepository } from "@/core/repositories";

export class MessageService {
  private repo: MessageRepository;
  constructor() {
    this.repo = new MessageRepository();
  }

  getForConversation(conversationId: string, workspaceSlug?: string) {
    return this.repo.getForConversation(conversationId, workspaceSlug);
  }

  /**
   * Envía mensaje humano y consume SSE del bot.
   * Devuelve función cancel() para abortar el stream.
   */
  sendWithStream(
    params: {
      conversationId: string;
      content: string;
      workspaceSlug?: string;
      fileUrls?: string[];
    },
    handlers: {
      onHumanSavedId?: (id: string) => void;
      onChunk?: (chunk: string, suggestTicket: boolean) => void;
      onDone?: () => void;
      onError?: (err: Error) => void;
    }
  ) {
    return this.repo.sendWithStream(
      {
        conversationId: params.conversationId,
        content: params.content,
        workspaceSlug: params.workspaceSlug,
        fileUrls: params.fileUrls,
        type: "text",
      },
      handlers
    );
  }
}
