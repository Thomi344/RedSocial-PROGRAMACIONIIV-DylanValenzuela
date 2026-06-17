import { Controller, Get, Put, Body, Req, UseInterceptors, UploadedFile, BadRequestException,UnauthorizedException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsuariosService } from './usuarios.service';
import {CloudinaryService } from '../cloudinary/cloudinary.service';
import { JwtService } from '@nestjs/jwt';
@Controller('usuarios')
export class UsuariosController {
    constructor(private usuariosService: UsuariosService, private cloudinaryService: CloudinaryService, private jwtService: JwtService) {}

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

    // --- 1. Obtener mi perfil (GET /usuarios/mi-perfil) ---
    @Get('mi-perfil')
    async obtenerMiPerfil(@Req() request: any) {
        const usuarioLogueado = this.obtenerUsuarioDelToken(request);
        if (!usuarioLogueado) {
        throw new BadRequestException('Token inválido o usuario no autenticado');
        }
        return this.usuariosService.obtenerPerfil(usuarioLogueado.sub || usuarioLogueado.id);
    }

    // --- 2. Actualizar mi perfil (PUT /usuarios/actualizar) ---
    @Put('actualizar')
    @UseInterceptors(FileInterceptor('fotoPerfil')) // 'fotoPerfil' es el nombre del campo que se espera para la imagen en el formulario
    async actualizarPerfil( @Req() request: any,@Body() datosPerfil: any,@UploadedFile() file: Express.Multer.File) {
        const usuarioLogueado = this.obtenerUsuarioDelToken(request);
        if (!usuarioLogueado) {
        throw new BadRequestException('Token inválido o usuario no autenticado');
        }

        let fotoUrl: string | undefined = undefined;

        // Si el usuario envió un archivo de imagen, lo subimos a Cloudinary
        if (file) {
        try {
            const subida = await this.cloudinaryService.uploadImage(file);
            fotoUrl = subida.url;
        } catch (error) {
            throw new BadRequestException('Error al subir la imagen de perfil a la nube');
        }}
        
        return this.usuariosService.actualizarPerfil(
            usuarioLogueado.sub || usuarioLogueado.id, 
            datosPerfil, 
            fotoUrl
        );
        
    }
}