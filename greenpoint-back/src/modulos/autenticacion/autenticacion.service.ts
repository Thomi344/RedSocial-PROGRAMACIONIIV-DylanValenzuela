import { BadRequestException, UnauthorizedException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {Usuario, UsuarioDocument} from '../usuarios/entidades/usuario.schema';
import {RegistroDto} from './dto/registro.dto';
import {LoginDto} from './dto/login.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import bcrypt from 'bcryptjs';
import {JwtService} from '@nestjs/jwt';

@Injectable()
export class AutenticacionService {

    constructor( @InjectModel(Usuario.name) private usuarioModel: Model<UsuarioDocument>,private cloudinaryService: CloudinaryService, private jwtService: JwtService ) {}

    // --- Registrar usuario ---
    async registrar(registroDto: RegistroDto, file?: Express.Multer.File){
        const { nombre, nombreUsuario, email, contrasena , fechaNacimiento, descripcion } = registroDto;

        // --- Validar si el email o nombre de usuario existen ---
        // --- Validar si el email ya existe ---
        const emailExiste = await this.usuarioModel.findOne({ email });
        if(emailExiste){
            throw new BadRequestException('Ese correo electrónico ya tiene una cuenta asociada. Si es tuyo, probá iniciando sesión.');
        }

        // --- Validar si el nombre de usuario ya existe ---
        const usuarioExiste = await this.usuarioModel.findOne({ nombreUsuario });
        if(usuarioExiste){
            throw new BadRequestException('Ese nombre de usuario ya está en uso. Por favor, elegí otro diferente.');
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
            fotoPerfil: urlFotoPerfil, 
            fechaNacimiento,
            descripcion
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
        // --- Generar token JWT ---
        const payload = { sub: usuario._id, nombreUsuario: usuario.nombreUsuario ,rol: usuario.rol || 'usuario'};
        const tokenGenerado = this.jwtService.sign(payload);
        // --- Retornar datos del usuario logeado (sin la contraseña) ---
        return {
            mensaje: 'Inicio de sesión exitoso',
            token: tokenGenerado,
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

