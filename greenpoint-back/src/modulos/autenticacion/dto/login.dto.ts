import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
@IsString()
    @IsNotEmpty({ message: 'El correo o usuario es obligatorio' })
    identificador!: string; //"identificador"

    @IsString()
    @IsNotEmpty({ message: 'La contraseña es obligatoria' })
    contrasena!: string;
    }