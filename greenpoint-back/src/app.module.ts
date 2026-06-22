import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsuariosModule } from './modulos/usuarios/usuarios.module';
import { AutenticacionModule } from './modulos/autenticacion/autenticacion.module';
import { PublicacionesModule } from './modulos/publicaciones/publicaciones.module';
import { CloudinaryModule } from './modulos/cloudinary/cloudinary.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env['MONGO_URL'] || ''),
    UsuariosModule,
    AutenticacionModule,
    PublicacionesModule,
    CloudinaryModule,
  ],
  providers: [],
  controllers: [],
})
export class AppModule {}
