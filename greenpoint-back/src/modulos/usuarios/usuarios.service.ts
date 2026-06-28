import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import{ Usuario, UsuarioDocument } from './entidades/usuario.schema';
import bcrypt from 'bcryptjs';
@Injectable()
export class UsuariosService {

    constructor(@InjectModel(Usuario.name) private usuarioModel: Model<UsuarioDocument>) {}

    // === Metodos de Usuario ===
    // --- Obtener Perfil por ID ---
    async obtenerPerfil(id: string): Promise<UsuarioDocument> {
        // Buscamos el usuario y con .select('-password') excluimos la contraseña
        const usuario = await this.usuarioModel.findById(id).select('-contrasena');
        if (!usuario) {
        throw new NotFoundException('Usuario no encontrado');
        }
        return usuario;
    }

    // ---  Actualizar Perfil ---
    async actualizarPerfil(id: string, datosActualizados: any, fotoUrl?: string): Promise<UsuarioDocument> {
        const campos = { ...datosActualizados };

        // Si el usuario subió una foto nueva procesada por Cloudinary, la asignamos
        if (fotoUrl) {
        campos.fotoPerfil = fotoUrl;
        }

        // --- Actualizamos el usuario y retornamos el nuevo documento sin la contraseña ---
        const usuarioActualizado = await this.usuarioModel
        .findByIdAndUpdate(id, { $set: campos }, { new: true })
        .select('-contrasena');

        if (!usuarioActualizado) {
        throw new NotFoundException('No se pudo encontrar el usuario para actualizar');
        }

        return usuarioActualizado;
    }

    // === Metodos Admin ===
    // --- Listar todos los usuarios ---
    async listarTodosLosUsuarios(){
        return this.usuarioModel.find().select('-contrasena').exec();
    }
    // --- Cambiar estado de usuario ---
    async cambiarEstado(id: string, activo: boolean) {
        const usuarioActualizado = await this.usuarioModel.findByIdAndUpdate(id, { activo }, { new: true }).select('-contrasena');
        if (!usuarioActualizado) {
            throw new NotFoundException('Usuario no encontrado');
        }
        return {mensaje: activo ? 'Usuario habilitado correctamente' : 'Usuario deshabilitado correctamente', usuario: usuarioActualizado};
    }
    // ---Crear usuario admin ---
    async crearDesdeAdmin (datos: any){
        // --- Encriptar contraseña ---
        const salt = await bcrypt.genSalt(10);
        const contrasenaEncriptada = await bcrypt.hash(datos.contrasena, salt);
        const nuevoUsuario = new this.usuarioModel({
            ...datos,
            contrasena: contrasenaEncriptada,
            rol: datos.rol || 'usuario'});

        const usuarioGuardado = await nuevoUsuario.save();
        // --- Retornar datos del nuevo usuario (sin la contraseña) ---
        const { contrasena, ...usuarioSinContrasena } = usuarioGuardado.toObject();
        return {mensaje: 'Usuario creado exitosamente', usuario: usuarioSinContrasena};


    }
}

