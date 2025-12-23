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
    let code = "INTERNAL_SERVER_ERROR"; // Default code

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      // Handle NestJS ValidationPipe errors (usually 400 with array of messages)
      if (
        status === HttpStatus.BAD_REQUEST &&
        typeof exceptionResponse === "object" &&
        exceptionResponse !== null &&
        "message" in exceptionResponse &&
        Array.isArray((exceptionResponse as any).message)
      ) {
        code = "VALIDATION_ERROR";
        message = (exceptionResponse as any).message; // Details
      }
      // Handle 404: Distinguish between Route Not Found and Resource Not Found
      else if (status === HttpStatus.NOT_FOUND) {
        const errorMsg =
          typeof exceptionResponse === "string"
            ? exceptionResponse
            : (exceptionResponse as any).message;

        if (typeof errorMsg === "string" && errorMsg.startsWith("Cannot")) {
          code = "ROUTE_NOT_FOUND"; // Default NestJS 404 message for routes
        } else {
          code = "RESOURCE_NOT_FOUND"; // Custom 404 from services (User not found, etc)
        }
        message = errorMsg;
      } else {
        // Generic HttpException
        message = exceptionResponse;
        // Try to derive code from status or message if possible, else generic
        code = HttpStatus[status] || "HTTP_ERROR";

        // Use custom message if object
        if (
          typeof exceptionResponse === "object" &&
          (exceptionResponse as any).message
        ) {
          message = (exceptionResponse as any).message;
        }
      }
    } else if (exception instanceof AxiosError) {
      status = exception.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      message = exception.response?.data || exception.message;
      code = "UPSTREAM_SERVICE_ERROR";

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

    // Normalize message structure
    const jsonResponse = {
      statusCode: status,
      code, // The new standard tag
      message, // Human readable or details
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(jsonResponse);
  }
}
