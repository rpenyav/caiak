import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { ConversationsService } from '../conversations/conversations.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private workspacesService: WorkspacesService,
    private conversationsService: ConversationsService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user || !user.roles) {
      return false;
    }

    // Verificar roles del usuario en el workspace o conversación
    const workspaceSlug =
      request.body.workspaceSlug || request.params.workspaceSlug;
    const conversationId =
      request.body.conversationId || request.params.conversationId;

    if (workspaceSlug) {
      const workspace = await this.workspacesService.findBySlug(workspaceSlug);
      if (!workspace) {
        return false;
      }
      return user.roles.some((role: string) => workspace.roles.includes(role));
    }

    if (conversationId) {
      const conversation =
        await this.conversationsService.findById(conversationId);
      if (!conversation) {
        return false;
      }
      return user.roles.some((role: string) =>
        conversation.roles.includes(role),
      );
    }

    return user.roles.some((role: string) => roles.includes(role));
  }
}
