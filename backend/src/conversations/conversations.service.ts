import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, SortOrder } from 'mongoose';
import { Conversation, ConversationDocument } from './conversations.schema';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { GetConversationsQueryDto } from './dto/get-conversations-query.dto';
import { WorkspacesService } from '../workspaces/workspaces.service';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectModel(Conversation.name)
    private conversationModel: Model<ConversationDocument>,
    private workspacesService: WorkspacesService,
  ) {}

  async create(
    createConversationDto: CreateConversationDto,
  ): Promise<Conversation> {
    // Validar que el workspaceSlug exista
    const workspace = await this.workspacesService.findBySlug(
      createConversationDto.workspaceSlug,
    );
    if (!workspace) {
      throw new BadRequestException(
        `Workspace con slug "${createConversationDto.workspaceSlug}" no encontrado`,
      );
    }

    const newConversation = new this.conversationModel(createConversationDto);
    return newConversation.save();
  }

  async findAll(query: GetConversationsQueryDto): Promise<{
    pageSize: number;
    pageNumber: number;
    sortBy: string;
    sortDirection: string;
    numberOfResults: number;
    list: Conversation[];
  }> {
    const {
      pageSize = 10,
      pageNumber = 1,
      sortBy = 'createdAt',
      sortDirection = 'desc',
    } = query;

    const skip = (pageNumber - 1) * pageSize;
    const sort: { [key: string]: SortOrder } = {
      [sortBy]: sortDirection as SortOrder,
    };

    // Validar sortBy
    if (!['name', 'createdAt', 'updatedAt'].includes(sortBy)) {
      throw new BadRequestException(
        `Campo de ordenamiento inválido: ${sortBy}`,
      );
    }

    // Obtener la lista paginada
    const list = await this.conversationModel
      .find()
      .skip(skip)
      .limit(pageSize)
      .sort(sort)
      .exec();

    // Contar el total de documentos
    const numberOfResults = await this.conversationModel
      .countDocuments()
      .exec();

    return {
      pageSize,
      pageNumber,
      sortBy,
      sortDirection,
      numberOfResults,
      list,
    };
  }

  async findAllByWorkspace(workspaceSlug: string): Promise<Conversation[]> {
    // Validar que el workspaceSlug exista
    const workspace = await this.workspacesService.findBySlug(workspaceSlug);
    if (!workspace) {
      throw new BadRequestException(
        `Workspace con slug "${workspaceSlug}" no encontrado`,
      );
    }

    return this.conversationModel.find({ workspaceSlug }).exec();
  }

  async findById(id: string): Promise<Conversation> {
    const conversation = await this.conversationModel.findById(id).exec();
    if (!conversation) {
      throw new NotFoundException(`Conversación con ID "${id}" no encontrada`);
    }
    return conversation;
  }
}
