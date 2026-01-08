/**
 * This file is a shim for @nestjs/swagger to prevent server-side dependencies
 * from being bundled in the client-side application.
 * It exports no-op decorators and empty classes/interfaces.
 */

export const ApiProperty = () => () => {};
export const ApiPropertyOptional = () => () => {};
export const ApiTags = () => () => {};
export const ApiOperation = () => () => {};
export const ApiResponse = () => () => {};
export const ApiBearerAuth = () => () => {};
export const ApiQuery = () => () => {};
export const ApiParam = () => () => {};
export const ApiBody = () => () => {};
export const ApiHeader = () => () => {};
export const ApiConsumes = () => () => {};
export const ApiProduces = () => () => {};
export const ApiExcludeEndpoint = () => () => {};
export const ApiExtraModels = () => () => {};

export class PartialType {}
export class OmitType {}
export class PickType {}
export class IntersectionType {}

export const DocumentBuilder = class {
  setTitle() {
    return this;
  }
  setDescription() {
    return this;
  }
  setVersion() {
    return this;
  }
  addBearerAuth() {
    return this;
  }
  build() {
    return {};
  }
};

export const SwaggerModule = class {
  static createDocument() {
    return {};
  }
  static setup() {}
};
