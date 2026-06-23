import { Controller, Post, Body, UploadedFile, UseInterceptors, UnauthorizedException,BadRequestException ,ParseFilePipe,MaxFileSizeValidator,Headers} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AutenticacionService } from './autenticacion.service';
import { RegistroDto } from './dto/registro.dto';
import { LoginDto } from './dto/login.dto';
import {JwtService} from '@nestjs/jwt';
import 'multer'; // Para que reconozca el tipo de archivo

@Controller('autenticacion')
export class AutenticacionController {
    constructor(private readonly autenticacionService: AutenticacionService, private readonly jwtService: JwtService) {}
    // --- Helper interno para extraer el token del encabezado ---
    private extraerToken(authHeader: string): string {
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                throw new UnauthorizedException('Falta el token de autorización o el formato es incorrecto');
            }
            // Devuelve solo el token limpio (quita el "Bearer ")
            return authHeader.split(' ')[1];
        }
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

// --- Ruta para AUTORIZAR (Validar token al abrir la app) ---
    @Post('autorizar')
    async autorizar(@Headers('authorization') authHeader: string) {
        const token = this.extraerToken(authHeader);
        try {
            // --- Verificamos y decodificamos el token JWT ---
            const payload = this.jwtService.verify(token, { secret: process.env['JWT_SECRET'] });
            
            // --- Retornamos que el token es válido y los datos del usuario (payload) ---
            return {
                valido: true,
                usuario: payload
            };
        } catch (error) {
            throw new UnauthorizedException('Token inválido o expirado. Iniciá sesión nuevamente.');
        }
    }

    // --- Ruta para REFRESCAR (Dar un nuevo token de 15 min) ---
    @Post('refrescar')
    async refrescar(@Headers('authorization') authHeader: string) {
        const token = this.extraerToken(authHeader);
        try {
            //--- 1. Verificamos y decodificamos el token JWT ---
            // --- Si el token es inválido o expiró, se lanzará una excepción y se atrapará en el catch ---
            const payload = this.jwtService.verify(token, { secret: process.env['JWT_SECRET'] });
            
            //--- 2. Extraemos los datos del usuario del payload, excluyendo iat y exp ---
            const { iat, exp, ...datosUsuario } = payload;
            
            //--- 3. Generamos un nuevo token con los mismos datos del usuario ---
            const nuevoToken = this.jwtService.sign(datosUsuario);
            
            return {
                token: nuevoToken
            };
        } catch (error) {
            throw new UnauthorizedException('No se puede refrescar. El token es inválido o ya expiró.');
        }
    }
}