import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, SortOrder, Types } from 'mongoose';
import { Conversation, ConversationDocument } from './conversations.schema';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { GetConversationsQueryDto } from './dto/get-conversations-query.dto';
import { WorkspacesService } from '../workspaces/workspaces.service';

// helper para filtro de createdBy que acepte string u ObjectId
function buildCreatedByFilter(userId: string) {
  const isValid = Types.ObjectId.isValid(userId);
  if (isValid) {
    const oid = new Types.ObjectId(userId);
    // Admitimos que en BD haya docs antiguos con string o nuevos con ObjectId
    return { $in: [oid, userId] };
  }
  return userId; // solo string
}

@Injectable()
export class ConversationsService {
  constructor(
    @InjectModel(Conversation.name)
    private conversationModel: Model<ConversationDocument>,
    private workspacesService: WorkspacesService,
  ) {}

  async create(
    createConversationDto: CreateConversationDto,
    userId: string, // <- se mantiene para asegurar createdBy
  ): Promise<Conversation> {
    const workspace = await this.workspacesService.findBySlug(
      createConversationDto.workspaceSlug,
    );
    if (!workspace) {
      throw new BadRequestException(
        `Workspace con slug "${createConversationDto.workspaceSlug}" no encontrado`,
      );
    }

    const newConversation = new this.conversationModel({
      ...createConversationDto,
      createdBy: new Types.ObjectId(userId),
    });

    return newConversation.save();
  }

  async findAll(
    query: GetConversationsQueryDto,
    userId: string, // <- endpoints HTTP siguen pasando userId
  ): Promise<{
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

    if (!['name', 'createdAt', 'updatedAt'].includes(sortBy)) {
      throw new BadRequestException(
        `Campo de ordenamiento inválido: ${sortBy}`,
      );
    }

    const filter = { createdBy: buildCreatedByFilter(userId) };

    const [list, numberOfResults] = await Promise.all([
      this.conversationModel
        .find(filter)
        .skip(skip)
        .limit(pageSize)
        .sort(sort)
        .exec(),
      this.conversationModel.countDocuments(filter).exec(),
    ]);

    return {
      pageSize,
      pageNumber,
      sortBy,
      sortDirection,
      numberOfResults,
      list,
    };
  }

  async findAllByWorkspace(
    workspaceSlug: string,
    userId: string,
  ): Promise<Conversation[]> {
    const workspace = await this.workspacesService.findBySlug(workspaceSlug);
    if (!workspace) {
      throw new BadRequestException(
        `Workspace con slug "${workspaceSlug}" no encontrado`,
      );
    }

    return this.conversationModel
      .find({
        workspaceSlug,
        createdBy: buildCreatedByFilter(userId),
      })
      .exec();
  }

  // userId es OPCIONAL para no romper callers internos existentes
  async findById(id: string, userId?: string): Promise<Conversation> {
    const baseFilter: any = { _id: new Types.ObjectId(id) };
    if (userId) {
      baseFilter.createdBy = buildCreatedByFilter(userId);
    }

    const conversation = await this.conversationModel
      .findOne(baseFilter)
      .exec();

    if (!conversation) {
      throw new NotFoundException(`Conversación no encontrada`);
    }
    return conversation;
  }
}
