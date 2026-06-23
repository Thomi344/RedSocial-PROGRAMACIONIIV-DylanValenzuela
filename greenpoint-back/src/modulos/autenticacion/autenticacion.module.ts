import { Module } from '@nestjs/common';
import {JwtModule} from '@nestjs/jwt';
import { AutenticacionController } from './autenticacion.controller';
import { AutenticacionService } from './autenticacion.service';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [UsuariosModule, CloudinaryModule, JwtModule.register({
    secret: process.env['JWT_SECRET'],
    signOptions: { expiresIn: '2m' },
  })],
  controllers: [AutenticacionController],
  providers: [AutenticacionService],
})
export class AutenticacionModule {}
