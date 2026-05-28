import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsuariosModule } from './modulos/usuarios/usuarios.module';
import { AutenticacionModule } from './modulos/autenticacion/autenticacion.module';
import { PublicacionesModule } from './modulos/publicaciones/publicaciones.module';

@Module({
  imports: [UsuariosModule, AutenticacionModule, PublicacionesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
