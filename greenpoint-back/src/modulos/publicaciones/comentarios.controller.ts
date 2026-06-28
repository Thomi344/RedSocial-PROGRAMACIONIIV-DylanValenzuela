import { Controller, Get, Post, Put, Delete, Param, Body, Query, Req, UnauthorizedException } from '@nestjs/common';
import { PublicacionesService } from './publicaciones.service';
import { JwtService } from '@nestjs/jwt';


@Controller('publicaciones/:id/comentarios')
export class ComentariosController {
    constructor(private publicacionesService: PublicacionesService, private jwtService: JwtService) {}

    // --- Obtener Usuario del token  ---
    private obtenerUsuarioDelToken(request: any) {
        const authHeader = request.headers.authorization;
        if (!authHeader) throw new UnauthorizedException('Falta el token de autorización');
        
        const token = authHeader.split(' ')[1]; 
        
        try {
            return this.jwtService.verify(token, { secret: process.env['JWT_SECRET'] });
        } catch (e) {
            throw new UnauthorizedException('Token inválido o expirado. Iniciá sesión nuevamente.');
        }
    }

    // --- 1. Obtener Comentarios Paginados (GET) ---
    @Get()
    async obtenerComentarios(
        @Param('id') idPublicacion: string,
        @Query('pagina') pagina: string,
        @Query('limite') limite: string
    ) {
        // --- Convertir los parámetros a números, con valores por defecto (ej: página 1, límite 5) ---
        const numPagina = pagina ? parseInt(pagina, 10) : 1;
        const numLimite = limite ? parseInt(limite, 10) : 5;
        
        return this.publicacionesService.obtenerComentariosPaginados(idPublicacion, numPagina, numLimite);
    }

    // --- 2. Agregar Comentario (POST) ---
    @Post()
    async agregarComentario(
        @Param('id') idPublicacion: string, 
        @Body('texto') texto: string, 
        @Req() request: any
    ) {
        // --- Validar que el comentario no esté vacío ---
        if (!texto || texto.trim() === '') {
            throw new UnauthorizedException('El comentario no puede estar vacío');
        }
        const usuario = this.obtenerUsuarioDelToken(request);
        return this.publicacionesService.agregarComentario(idPublicacion, usuario.sub, texto);
    }

    // --- 3. Modificar Comentario (PUT) ---
    @Put(':idComentario')
    async modificarComentario(
        @Param('id') idPublicacion: string,
        @Param('idComentario') idComentario: string,
        @Body('texto') nuevoTexto: string,
        @Req() request: any
    ) {
        // --- Validar que el texto editado no esté vacío ---
        if (!nuevoTexto || nuevoTexto.trim() === '') {
            throw new UnauthorizedException('El texto editado no puede estar vacío');
        }
        const usuario = this.obtenerUsuarioDelToken(request);
        return this.publicacionesService.modificarComentario(idPublicacion, idComentario, usuario.sub, nuevoTexto);
    }

    // --- 4. Eliminar Comentario (DELETE) ---
    @Delete(':idComentario')
    async eliminarComentario(
        @Param('id') idPublicacion: string,
        @Param('idComentario') idComentario: string,
        @Req() request: any
    ) {
        // --- Validar que el usuario esté autenticado ---
        const usuario = this.obtenerUsuarioDelToken(request);
        return this.publicacionesService.eliminarComentario(idPublicacion, idComentario, usuario.sub, usuario.rol);
    }
}