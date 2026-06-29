import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class AdminGuard implements CanActivate {

  constructor(private jwtService: JwtService) {}
  
  canActivate(context: ExecutionContext,): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    // --- Obtener el token del encabezado de autorización ---
    const authHeader = request.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Falta el token de autorización o el formato es incorrecto');
    }
    // --- Extraer el token del encabezado ---
    const token = authHeader.split(' ')[1];

    try {
      // --- Verifica el token y extrae el payload ---
      const payload = this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
      // --- Verifica si el rol del usuario es 'admin' ---
      
      if (payload.perfil !== 'admin' && payload.rol !== 'admin') {
        throw new ForbiddenException('Acceso denegado: se requiere rol de administrador');
      }
      // --- Si todo está bien, permite el acceso ---
      request.user = payload; // Agrega el payload del token al objeto de la solicitud para su uso posterior
      return true;
    } catch (error) {
      if(error instanceof ForbiddenException) throw error;
      throw new UnauthorizedException('Token inválido');
    }

  }
}
