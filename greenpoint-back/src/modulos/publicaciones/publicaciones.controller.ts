import { Controller, Get, Post, Delete, Param, Body, Query, UseInterceptors, UploadedFile, Req, UnauthorizedException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PublicacionesService } from './publicaciones.service';
import { JwtService } from '@nestjs/jwt';

@Controller('publicaciones')
export class PublicacionesController {
    constructor(private publicacionesService: PublicacionesService, private jwtService: JwtService) {}

    // --- Obtener Usuario del token ---
    private obtenerUsuarioDelToken(request: any) {
            const authHeader = request.headers.authorization;
            if (!authHeader) throw new UnauthorizedException('Falta el token de autorización');
            
            // --- Extraer el token del encabezado---
            const token = authHeader.split(' ')[1]; 
            
            try {
                // --- Verificar y decodificar el token JWT ---
                return this.jwtService.verify(token, { secret: process.env['JWT_SECRET'] });
            } catch (e) {
                throw new UnauthorizedException('Token inválido o expirado. Iniciá sesión nuevamente.');
            }
        }

    // --- 1. Crear Publicación (POST) ---
    @Post()
    @UseInterceptors(FileInterceptor('imagen')) // Ataja el archivo adjunto
    async crearPublicacion(
        @Req() request: any,
        @Body('titulo') titulo: string,
        @Body('descripcion') descripcion: string,
        @UploadedFile() file: Express.Multer.File
    ) {
        const usuario = this.obtenerUsuarioDelToken(request); // Sacamos el ID del creador
        return this.publicacionesService.crearPublicacion(usuario.sub, titulo, descripcion, file);
    }
    // --- 2. Listar Publicaciones (GET) ---
    // Este endpoint es público, por lo que no exigimos token acá
    @Get()
    async listarPublicaciones(
        @Query('orden') orden: string,
        @Query('offset') offset: string,
        @Query('limit') limit: string,
        @Query('usuarioId') usuarioId: string // Para el filtro de "Mi Perfil"
    ) {
        /// --- Convertir offset y limit a números para su uso en la consulta ---
        const numOffset = offset ? parseInt(offset, 10) : 0;
        const numLimit = limit ? parseInt(limit, 10) : 10;
        
        return this.publicacionesService.listarPublicaciones(orden, numOffset, numLimit, usuarioId);
    }    
    // --- 3. Eliminar Publicación (DELETE Lógico) ---
    @Delete(':id')
    async eliminarPublicacion(@Param('id') id: string, @Req() request: any) {
        const usuario = this.obtenerUsuarioDelToken(request);
        return this.publicacionesService.eliminarPublicacion(id, usuario.sub, usuario.perfil);
    }
    // --- 4. Dar Me Gusta (POST) ---
    @Post(':id/like')
    async darMeGusta(@Param('id') id: string, @Req() request: any) {
        const usuario = this.obtenerUsuarioDelToken(request);
        return this.publicacionesService.darMeGusta(id, usuario.sub);
    }
    // --- 5. Sacar Me Gusta (DELETE) ---
    @Delete(':id/like')
    async sacarMeGusta(@Param('id') id: string, @Req() request: any) {
        const usuario = this.obtenerUsuarioDelToken(request);
        return this.publicacionesService.sacarMeGusta(id, usuario.sub);
    }
    // --- 6. Agregar Comentario (POST) ---
    @Post(':id/comentarios')
    async agregarComentario(
        @Param('id') id: string, 
        @Body('texto') texto: string, 
        @Req() request: any
    ) {
        if (!texto || texto.trim() === '') {
            throw new UnauthorizedException('El comentario no puede estar vacío');
        }
        const usuario = this.obtenerUsuarioDelToken(request);
        return this.publicacionesService.agregarComentario(id, usuario.sub, texto);
    }
    // --- 7. Eliminar Comentario (DELETE) ---
    @Delete(':id/comentarios/:idComentario')
    async eliminarComentario(
        @Param('id') id: string,
        @Param('idComentario') idComentario: string,
        @Req() request: any
    ) {
        const usuario = this.obtenerUsuarioDelToken(request);
        return this.publicacionesService.eliminarComentario(id, idComentario, usuario.sub, usuario.perfil);
    }
}


