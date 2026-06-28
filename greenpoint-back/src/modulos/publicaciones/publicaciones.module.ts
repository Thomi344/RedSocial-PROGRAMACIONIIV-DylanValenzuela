import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PublicacionesService } from './publicaciones.service';
import { PublicacionesController } from './publicaciones.controller';
import { Publicacion, PublicacionSchema } from './entidades/publicacion.schema';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { JwtModule } from '@nestjs/jwt';
import { ComentariosController } from './comentarios.controller';
import { EstadisticasController } from './estadisticas.controller';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Publicacion.name, schema: PublicacionSchema }
    ]),CloudinaryModule,JwtModule.register({
      secret: process.env['JWT_SECRET']
    })

  ],
  controllers: [PublicacionesController,ComentariosController,EstadisticasController],
  providers: [PublicacionesService],
})
export class PublicacionesModule {}
