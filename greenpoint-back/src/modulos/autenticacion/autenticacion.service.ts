import { BadRequestException, UnauthorizedException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {Usuario, UsuarioDocument} from '../usuarios/entidades/usuario.schema';
import {RegistroDto} from './dto/registro.dto';
import {LoginDto} from './dto/login.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import bcrypt from 'bcryptjs';

@Injectable()
export class AutenticacionService {

    constructor( @InjectModel(Usuario.name) private usuarioModel: Model<UsuarioDocument>,private cloudinaryService: CloudinaryService ) {}

    // --- Registrar usuario ---
    async registrar(registroDto: RegistroDto, file?: Express.Multer.File){
        const { nombre, nombreUsuario, email, contrasena } = registroDto;

        // --- Validar si el email o nombre de usuario existen ---
        const usuarioExiste = await this.usuarioModel.findOne({$or: [{ email }, { nombreUsuario }]});
        if(usuarioExiste){
            throw new BadRequestException('El correo electrónico  ya están registrados');
        }
        
        let urlFotoPerfil: string = '';
        // --- SUBIR LA IMAGEN A CLOUDINARY ---
        // archivo en memoria al servicio de Cloudinary
        if (file) {
            const fotoSubida = await this.cloudinaryService.uploadImage(file);
            urlFotoPerfil = fotoSubida.secure_url;
        }else{
            urlFotoPerfil = ""
        }

        // --- Encriptar contraseña ---
        const salt = await bcrypt.genSalt(10);
        const contrasenaEncriptada = await bcrypt.hash(contrasena, salt);

        // --- Crear nuevo usuario ---
        const nuevoUsuario = new this.usuarioModel({
            nombre,
            nombreUsuario,
            email,
            contrasena: contrasenaEncriptada,
            // Guardam la URL segura que acaba de generar Cloudinary
            fotoPerfil: urlFotoPerfil, 
        });
        
        await nuevoUsuario.save();
        
        // --- Retornar datos del nuevo usuario (sin la contraseña) ---
        return {
            mensaje: 'Usuario registrado exitosamente',
            usuario: {
                id: nuevoUsuario._id,
                nombre: nuevoUsuario.nombre,
                nombreUsuario: nuevoUsuario.nombreUsuario,
                email: nuevoUsuario.email,
                fotoPerfil: nuevoUsuario.fotoPerfil,
            },
        };
    }
    // --- Logear usuario ---
    async login(loginDto: LoginDto){
        const {identificador, contrasena} = loginDto;

        // --- Buscar usuario por email ---
        const usuario = await this.usuarioModel.findOne({$or: [{ email: identificador }, { nombreUsuario: identificador }]});
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
                nombreUsuario: usuario.nombreUsuario,
                nombre: usuario.nombre,
                email: usuario.email,
                fotoPerfil: usuario.fotoPerfil,
            },
        };
    }
}

