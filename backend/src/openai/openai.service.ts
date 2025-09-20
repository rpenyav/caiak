import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { Observable } from 'rxjs';
import { PromptsService } from '../prompts/prompts.service';

@Injectable()
export class OpenaiService implements OnModuleInit {
  private openai: OpenAI;
  private systemPrompt: string = 'prompt de pruebas'; // Prompt por defecto hardcoded

  private readonly model: string;
  private readonly maxTokens: number;
  private readonly cps: number;
  private readonly tick: number;

  constructor(
    private configService: ConfigService,
    private promptsService: PromptsService,
  ) {
    this.model =
      this.configService.get<string>('OPENAI_MODEL') || 'gpt-4o-mini';
    this.maxTokens = parseInt(
      this.configService.get<string>('CHATBOT_MAX_TOKENS') || '200',
      10,
    );
    this.cps = parseInt(
      this.configService.get<string>('CHATBOT_TYPE_CPS') || '90',
      10,
    );
    this.tick = parseInt(
      this.configService.get<string>('CHATBOT_TYPE_TICK') || '16',
      10,
    );

    try {
      this.openai = new OpenAI({
        apiKey: this.configService.get<string>('OPENAI_API_KEY'),
        baseURL:
          this.configService.get<string>('OPENAI_BASE') ||
          'https://api.openai.com/v1',
      });
    } catch (error) {
      console.error('Error inicializando OpenAI:', error);
      throw new Error('No se pudo inicializar el cliente de OpenAI');
    }
  }

  async onModuleInit() {
    try {
      const promptDoc = await this.promptsService.findFirstPrompt();
      this.systemPrompt = promptDoc.prompt;
      console.log(
        `Usando prompt de la base de datos: "${this.systemPrompt}" (appId: "${promptDoc.appId}")`,
      );
    } catch (error) {
      console.warn(
        `No se encontraron prompts en la base de datos, usando prompt por defecto: "${this.systemPrompt}"`,
      );
    }
  }

  async testConnection(): Promise<string> {
    try {
      const response = await this.openai.models.list();
      return `Conexión exitosa a OpenAI. Modelos disponibles: ${response.data.map((model) => model.id).join(', ')}`;
    } catch (error) {
      console.error('Error en testConnection:', error);
      throw new Error(
        `Fallo al conectar con la API de OpenAI: ${error.message}`,
      );
    }
  }

  async generateResponse(userMessage: string): Promise<string> {
    try {
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: 'system', content: this.systemPrompt },
        { role: 'user', content: userMessage },
      ];

      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages,
        max_tokens: this.maxTokens,
        temperature: 0.7,
      });

      return (
        completion.choices[0].message.content ||
        'No se recibió respuesta válida.'
      );
    } catch (error) {
      console.error('Error generando respuesta:', error);
      throw new Error(`Fallo al generar respuesta: ${error.message}`);
    }
  }

  async generateStreamResponse(
    history: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
  ): Promise<Observable<string>> {
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: this.systemPrompt },
      ...history,
    ];

    try {
      const stream = await this.openai.chat.completions.create({
        model: this.model,
        messages,
        max_tokens: this.maxTokens,
        temperature: 0.7,
        stream: true,
      });

      return new Observable<string>((observer) => {
        (async () => {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              observer.next(content);
            }
          }
          observer.complete();
        })().catch((error) => {
          observer.error(
            new Error(`Error en streaming de OpenAI: ${error.message}`),
          );
        });
      });
    } catch (error) {
      console.error('Error iniciando stream:', error);
      throw new Error(`Fallo al iniciar streaming: ${error.message}`);
    }
  }

  getTypingConfig() {
    return {
      cps: this.cps,
      tick: this.tick,
    };
  }
}
