import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

// --- DTO para el registro de usuarios, con validaciones ---
export class RegistroDto {
    @IsString()
    @IsNotEmpty({ message: 'El nombre es obligatorio' })
    nombre!: string;

    @IsString()
    @IsNotEmpty({ message: 'El nombre de usuario es obligatorio' })
    nombreUsuario!: string;
    
    @IsEmail({}, { message: 'El formato del email no es válido' })
    email!: string;

    @IsString()
    @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
    contrasena!: string;

    // --- Como la imagen se sube a Cloudinary desde el Front, el Back solo recibe la URL (un string) ---
    @IsOptional()
    @IsString()
    fotoPerfil?: string; 
}