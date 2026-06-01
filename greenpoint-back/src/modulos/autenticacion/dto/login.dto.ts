import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
    @IsEmail({}, { message: 'El formato del email no es válido' })
    email!: string;

    @IsString()
    @IsNotEmpty({ message: 'La contraseña es obligatoria' })
    contrasena!: string;
}