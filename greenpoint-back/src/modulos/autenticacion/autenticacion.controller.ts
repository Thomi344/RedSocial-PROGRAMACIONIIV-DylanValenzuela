import { Controller, Post, Body, UploadedFile, UseInterceptors, BadRequestException ,ParseFilePipe,MaxFileSizeValidator} from '@nestjs/common';
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
        fileFilter: (req, file, cb) => {
        // Valida que el archivo sea sí o sí una imagen
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
            return cb(new BadRequestException('Solo se permiten imágenes (jpg, jpeg, png, webp)'), false);
        }
        cb(null, true);
        }
    }))
    // --- endpoint espera Dto  y un archivo 'foto' ---
async registrarUsuario( 
        @Body() registroDto: RegistroDto, 
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({
                        maxSize: 4 * 1024 * 1024,
                        message: 'La foto es muy pesada. El límite máximo es de 4MB.'
                    })
                ],
                fileIsRequired: true,
                exceptionFactory(error) {
                    // Si no sube archivo, tira  error personalizado
                    if (error.includes('required')) {
                        throw new BadRequestException('La foto de perfil es obligatoria');
                    }
                    throw new BadRequestException(error);
                },
            })
        ) file: Express.Multer.File 
    ) {
        // --- Llamamos al servicio de autenticación para registrar el usuario, pasándole el DTO y el archivo ---
        return this.autenticacionService.registrar(registroDto, file);
    }

    // --- Ruta para login ---
    @Post('login')
    async loginUsuario(@Body() loginDto: LoginDto){
        return this.autenticacionService.login(loginDto);
    }
}