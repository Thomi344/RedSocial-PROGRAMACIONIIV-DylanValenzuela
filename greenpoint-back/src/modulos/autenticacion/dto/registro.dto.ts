import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength,MaxLength } from 'class-validator';

// --- DTO para el registro de usuarios, con validaciones ---
export class RegistroDto {
    @IsString()
    @IsNotEmpty({ message: 'El nombre es obligatorio' })
    nombre!: string;

    @IsString()
    @IsNotEmpty({ message: 'El nombre de usuario es obligatorio' })
    nombreUsuario!: string;
    
    @IsEmail({}, { message: 'El formato del email no es válido' })
    @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
    email!: string;

    @IsString()
    @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
    @IsNotEmpty({ message: 'La contraseña es obligatoria' })
    contrasena!: string;

    @IsString()
    @IsNotEmpty({ message: 'La fecha de nacimiento es obligatoria' })
    fechaNacimiento!: string;

    @IsOptional()
    @IsString()
    @MaxLength(250, { message: 'La descripción es demasiado larga' })
    descripcion?: string;    
}