import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";
import { AxiosError } from "axios";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: any = "Internal server error";

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.getResponse();
    } else if (exception instanceof AxiosError) {
      status = exception.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      message = exception.response?.data || exception.message;
      this.logger.warn(
        `Axios Error: ${JSON.stringify(message)} (Status: ${status})`
      );
    } else {
      const err = exception as any;
      if (err instanceof Error) {
        message = err.message;
      }
      this.logger.error(`Unknown Error: ${JSON.stringify(message)}`);
    }

    // Normalize message to be an object if possible
    if (typeof message === "string") {
      message = { message };
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      ...message,
    });
  }
}
