import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LogsService } from 'src/logs/logs.service';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  constructor(private logsService: LogsService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const { ip, method, originalUrl, user, body } = req;
    const userAgent = req.get('user-agent') || '';
    const userId = user
      ? (user as any).sub || (user as any).id || 'anonymous'
      : 'anonymous';
    const appId = user ? (user as any).appId || 'caiak-app-1' : 'caiak-app-1';
    const clientIp = ip || 'unknown';

    // Evitar loguear datos sensibles como contraseñas
    const safeBody = { ...body };
    if (safeBody.password) {
      safeBody.password = '[REDACTED]';
    }

    const startTime = Date.now();

    res.on('finish', () => {
      const { statusCode } = res;
      const responseTime = Date.now() - startTime;

      this.logger.log(
        `${method} ${originalUrl} ${statusCode} ${responseTime}ms - ${userAgent} ${clientIp} - userId: ${userId} appId: ${appId}`,
      );

      this.logsService.createLog(
        'access',
        userId,
        appId,
        clientIp,
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

    next();
  }
}
