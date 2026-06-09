import { Controller, Post, Body, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AutenticacionService } from './autenticacion.service';
import { RegistroDto } from './dto/registro.dto';
import { LoginDto } from './dto/login.dto';
import 'multer'; // Para que reconozca el tipo de archivo

@Controller('autenticacion')
export class AutenticacionController {
    constructor(private readonly autenticacionService: AutenticacionService) {}

    // --- Ruta para registrar un nuevo usuario ---
    @Post('registro')
    // --- interceptor de archivos para manejar la subida de la foto de perfil ---
    @UseInterceptors(FileInterceptor('foto', {
        limits: { fileSize: 4 * 1024 * 1024 }, // Límite exacto de 4MB
        fileFilter: (req, file, cb) => {
        // Valida que el archivo sea sí o sí una imagen
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
            return cb(new BadRequestException('Solo se permiten imágenes (jpg, jpeg, png, webp)'), false);
        }
        cb(null, true);
        }
    }))
    // --- Este endpoint espera un 'registroDto' con los datos del usuario y un archivo 'foto' con la imagen de perfil ---
    async registrarUsuario( @Body() registroDto: RegistroDto, @UploadedFile() file: Express.Multer.File ) {
        if (!file) {
        throw new BadRequestException('La foto de perfil es obligatoria');
        }
        
        // --- Llamamos al servicio de autenticación para registrar el usuario, pasándole el DTO y el archivo ---
        return this.autenticacionService.registrar(registroDto, file);
    }

    // --- Ruta para login ---
    @Post('login')
    async loginUsuario(@Body() loginDto: LoginDto){
        return this.autenticacionService.login(loginDto);
    }
}