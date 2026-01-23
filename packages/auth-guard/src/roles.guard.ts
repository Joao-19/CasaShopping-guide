import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "./roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    // Se não tiver usuário no request (não passou pelo JwtGuard) ou user.role não bater
    if (!user) return false;

    // Se o user.role for igual a algum dos requiredRoles (assumindo que user.role é string unica por enquanto)
    // No loginAdmin definimos payload.role = 'admin'
    return requiredRoles.some((role) => user.role === role);
  }
}
