import { Controller, Post } from '@nestjs/common';
import { AutenticacionService } from './autenticacion.service';
import {RegistroDto} from './dto/registro.dto';
import {LoginDto} from './dto/login.dto';
import { Body } from '@nestjs/common';
@Controller('autenticacion')
export class AutenticacionController {
    constructor( private readonly autenticacionService: AutenticacionService) {}

    // --- Ruta para registrar un nuevo usuario ---
    @Post('registro')
    async registrarUsuario(@Body() registroDto: RegistroDto){
        // --- El DTO se validará automáticamente gracias a ValidationPipe ---
        return this.autenticacionService.registrar(registroDto);
    }

    // --- Ruta para login ---
    @Post('login')
    async loginUsuario(@Body() loginDto: LoginDto){
        return this.autenticacionService.login(loginDto);
    }
}
