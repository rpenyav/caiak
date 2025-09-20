import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { ConversationsService } from '../conversations/conversations.service';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly workspacesService: WorkspacesService,
    private readonly conversationsService: ConversationsService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.roles) {
      throw new ForbiddenException('Usuario no autenticado o sin roles');
    }

    // Verificar si el endpoint es POST /workspaces
    const isCreateWorkspace =
      request.method === 'POST' && request.url.startsWith('/workspaces');
    if (isCreateWorkspace) {
      // Permitir acceso si el usuario tiene un rol de administrador
      const hasAdminRole =
        user.roles.includes('admin') || user.roles.includes('superadmin');
      if (!hasAdminRole) {
        throw new ForbiddenException(
          'Se requiere rol de administrador para crear un workspace',
        );
      }
      return true;
    }

    // Obtener workspaceSlug desde body, params o query
    let workspaceSlug =
      request.body?.workspaceSlug ||
      request.body?.slug || // Añadir soporte para request.body.slug
      request.params?.workspaceSlug ||
      request.query?.workspaceSlug;

    // Si hay un conversationId, intentar obtener workspaceSlug de la conversación
    const conversationId =
      request.params?.conversationId || request.body?.conversationId;
    if (!workspaceSlug && conversationId) {
      const conversation =
        await this.conversationsService.findById(conversationId);
      if (!conversation) {
        throw new BadRequestException(
          `Conversación con ID "${conversationId}" no encontrada`,
        );
      }
      workspaceSlug = conversation.workspaceSlug;
    }

    if (!workspaceSlug) {
      throw new BadRequestException('No se pudo determinar el workspaceSlug');
    }

    const workspace = await this.workspacesService.findBySlug(workspaceSlug);
    if (!workspace) {
      throw new ForbiddenException(
        `Workspace con slug "${workspaceSlug}" no encontrado`,
      );
    }

    const hasRole = user.roles.some((role: string) =>
      workspace.roles.includes(role),
    );
    if (!hasRole) {
      throw new ForbiddenException(
        'Usuario no tiene permisos para este workspace',
      );
    }

    return true;
  }
}
