import { BadRequestException, UnauthorizedException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {Usuario, UsuarioDocument} from '../usuarios/entidades/usuario.schema';
import {RegistroDto} from './dto/registro.dto';
import {LoginDto} from './dto/login.dto';
import bcrypt from 'bcryptjs';
@Injectable()
export class AutenticacionService {
    constructor( @InjectModel(Usuario.name) private usuarioModel: Model<UsuarioDocument>) {}

    // --- Registrar usuario ---
    async registrar(registroDto: RegistroDto){
        const {nombre,email,contrasena,fotoPerfil}= registroDto;

        // --- Validar si el email existe ---
        const usuarioExiste = await this.usuarioModel.findOne({email});
        if(usuarioExiste){
            throw new BadRequestException('El correo electrónico ya está registrado');
        }
        
        // --- Encriptar contraseña ---
        // --- 'salt' es un valor aleatorio que se agrega a la contraseña antes de encriptarla para hacerla más segura ---
        const salt = await bcrypt.genSalt(10);
        const contrasenaEncriptada = await bcrypt.hash(contrasena, salt);

        // --- Crear nuevo usuario ---
        const nuevoUsuario = new this.usuarioModel({
            nombre,
            email,
            contrasena: contrasenaEncriptada,
            fotoPerfil: fotoPerfil || '', // Si no se proporciona una foto, se asigna una cadena vacía
        });
        await nuevoUsuario.save();
        // --- Retornar datos del nuevo usuario (sin la contraseña) ---
        return {
            mensaje: 'Usuario registrado exitosamente',
            usuario: {
                id: nuevoUsuario._id,
                nombre: nuevoUsuario.nombre,
                email: nuevoUsuario.email,
                fotoPerfil: nuevoUsuario.fotoPerfil,
            },
        };
    }   

    // --- Logear usuario ---
    async login(loginDto: LoginDto){
        const {email, contrasena} = loginDto;

        // --- Buscar usuario por email ---
        const usuario = await this.usuarioModel.findOne({email});
        if(!usuario){
            throw new UnauthorizedException('Credenciales inválidas');
        }

        // --- Comparar contraseña ---
        const esContrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena);
        if(!esContrasenaValida){
            throw new UnauthorizedException('Credenciales inválidas');
        }

        // --- Retornar datos del usuario logeado (sin la contraseña) ---
        return {
            mensaje: 'Inicio de sesión exitoso',
            usuario: {
                id: usuario._id,
                nombre: usuario.nombre,
                email: usuario.email,
                fotoPerfil: usuario.fotoPerfil,
            },
        };
    }
}

