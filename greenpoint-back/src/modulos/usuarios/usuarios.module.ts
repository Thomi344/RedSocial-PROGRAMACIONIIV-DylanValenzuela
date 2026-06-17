import { Module } from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import { Usuario, UsuarioSchema } from './entidades/usuario.schema';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Usuario.name, schema: UsuarioSchema }]),
    CloudinaryModule, JwtModule.register({
      secret: process.env['JWT_SECRET']
    })
  ],
  controllers: [UsuariosController],
  providers: [UsuariosService],
  exports: [MongooseModule, UsuariosService]
})
export class UsuariosModule {}
