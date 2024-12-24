import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
        if (!requiredRoles) return true;

        const { user } = context.switchToHttp().getRequest();
        if (!user || !requiredRoles.includes(user.role)) {
            throw new ForbiddenException('You do not have permission to access this resource.');
        }

        return true;
    }
}




