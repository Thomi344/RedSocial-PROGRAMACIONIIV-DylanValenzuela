import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PublicacionesService } from './publicaciones.service'; 
import { AdminGuard } from '../autenticacion/guards/admin.guard';

@Controller('estadisticas')
@UseGuards(AdminGuard) 
export class EstadisticasController {
    constructor(private readonly publicacionesService: PublicacionesService) {}

    // --- 1. Publicaciones por usuario en un lapso de tiempo ---
    @Get('publicaciones-por-usuario')
    async getPublicacionesPorUsuario(
        @Query('inicio') inicio: string, 
        @Query('fin') fin: string
    ) {
        return this.publicacionesService.contarPublicacionesPorUsuario(inicio, fin);
    }

    // --- 2. Cantidad de comentarios totales en un lapso de tiempo ---
    @Get('comentarios-totales')
    async getComentariosTotales(
        @Query('inicio') inicio: string, 
        @Query('fin') fin: string
    ) {
        return this.publicacionesService.contarComentariosTotales(inicio, fin);
    }

    // --- 3. Cantidad de comentarios en cada publicación en un lapso de tiempo ---
    @Get('comentarios-por-publicacion')
    async getComentariosPorPublicacion(
        @Query('inicio') inicio: string, 
        @Query('fin') fin: string
    ) {
        return this.publicacionesService.contarComentariosPorPublicacion(inicio, fin);
    }
}