import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, SortOrder } from 'mongoose';
import { Workspace, WorkspaceDocument } from './workspaces.schema';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { GetWorkspacesQueryDto } from './dto/get-workspaces-query.dto';

@Injectable()
export class WorkspacesService {
  constructor(
    @InjectModel(Workspace.name)
    private workspaceModel: Model<WorkspaceDocument>,
  ) {}

  async create(createWorkspaceDto: CreateWorkspaceDto): Promise<Workspace> {
    try {
      const newWorkspace = new this.workspaceModel(createWorkspaceDto);
      return await newWorkspace.save();
    } catch (error) {
      throw new NotFoundException(
        `Error al crear el workspace: ${error.message}`,
      );
    }
  }

  async findAll(query: GetWorkspacesQueryDto): Promise<{
    pageSize: number;
    pageNumber: number;
    sortBy: string;
    sortDirection: string;
    numberOfResults: number;
    list: Workspace[];
  }> {
    const {
      pageSize = 10,
      pageNumber = 1,
      sortBy = 'createdAt',
      sortDirection = 'desc',
    } = query;

    const skip = (pageNumber - 1) * pageSize; // Calcular el número de documentos a omitir
    const sort: { [key: string]: SortOrder } = {
      [sortBy]: sortDirection as SortOrder,
    };

    // Validar sortBy para evitar valores inválidos
    if (!['slug', 'name', 'createdAt', 'updatedAt'].includes(sortBy)) {
      throw new NotFoundException(`Campo de ordenamiento inválido: ${sortBy}`);
    }

    // Obtener la lista paginada
    const list = await this.workspaceModel
      .find()
      .skip(skip)
      .limit(pageSize)
      .sort(sort)
      .exec();

    // Contar el total de documentos
    const numberOfResults = await this.workspaceModel.countDocuments().exec();

    return {
      pageSize,
      pageNumber,
      sortBy,
      sortDirection,
      numberOfResults,
      list,
    };
  }

  async findBySlug(slug: string): Promise<Workspace> {
    const workspace = await this.workspaceModel.findOne({ slug }).exec();
    if (!workspace) {
      throw new NotFoundException(`Workspace con slug "${slug}" no encontrado`);
    }
    return workspace;
  }
}
