import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LogsService } from 'src/logs/logs.service';
import { Request, Response } from 'express';

@Injectable()
export class AuthAndLogGuard implements CanActivate {
  private logger = new Logger('AuthAndLogGuard');

  constructor(
    private jwtService: JwtService,
    private logsService: LogsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();
    const { ip, method, originalUrl, body } = req;
    const userAgent = req.get('user-agent') || '';
    const clientIp = ip || 'unknown';

    // Verificar JWT
    const authHeader = req.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      await this.logRequest(
        method,
        originalUrl,
        clientIp,
        userAgent,
        body,
        res,
        'anonymous',
        'caiak-app-1',
      );
      return false;
    }

    const token = authHeader.replace('Bearer ', '');
    try {
      const payload = this.jwtService.verify(token);
      req.user = payload;
      await this.logRequest(
        method,
        originalUrl,
        clientIp,
        userAgent,
        body,
        res,
        payload.sub,
        payload.appId || 'caiak-app-1',
      );
      return true;
    } catch (error) {
      await this.logRequest(
        method,
        originalUrl,
        clientIp,
        userAgent,
        body,
        res,
        'anonymous',
        'caiak-app-1',
      );
      return false;
    }
  }

  private async logRequest(
    method: string,
    originalUrl: string,
    ip: string,
    userAgent: string,
    body: any,
    res: Response,
    userId: string,
    appId: string,
  ) {
    const safeBody = { ...body };
    if (safeBody.password) {
      safeBody.password = '[REDACTED]';
    }

    const startTime = Date.now();

    res.on('finish', () => {
      const { statusCode } = res;
      const responseTime = Date.now() - startTime;

      this.logger.log(
        `${method} ${originalUrl} ${statusCode} ${responseTime}ms - ${userAgent} ${ip} - userId: ${userId} appId: ${appId}`,
      );

      this.logsService.createLog(
        'access',
        userId,
        appId,
        ip,
        userAgent,
        {
          endpoint: originalUrl,
          method,
          statusCode,
          requestBody: safeBody,
          responseTime,
        },
        'info',
      );
    });
  }
}
