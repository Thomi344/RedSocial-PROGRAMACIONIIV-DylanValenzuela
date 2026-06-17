import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Publicacion, PublicacionDocument } from './entidades/publicacion.schema';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
@Injectable()
export class PublicacionesService {
  constructor(
    @InjectModel(Publicacion.name) private publicacionModel: Model<PublicacionDocument>,private cloudinaryService: CloudinaryService) {}

    // --- 1. Crear Publicación (POST) ---
    async crearPublicacion(usuarioId: string, titulo: string, descripcion: string, file?: Express.Multer.File) {
        let urlImagen = '';
        
        // --- Subir la imagen a Cloudinary si se proporciona un archivo ---
        if (file) {
            const fotoSubida = await this.cloudinaryService.uploadImage(file);
            urlImagen = fotoSubida.secure_url;
        }

        const nuevaPublicacion = new this.publicacionModel({
            usuario: usuarioId, //relación con el creador
            titulo,
            descripcion,
            imagen: urlImagen
        });

        return nuevaPublicacion.save();
    }

    // --- 2. Listar Publicaciones (GET) ---
    async listarPublicaciones(orden: string = 'fecha', offset: number = 0, limit: number = 10, usuarioIdFiltro?: string) {
        // --- Filtro base: solo publicaciones activas ---
        const filtro: any = { activa: true };
        
        // --- Si se proporciona un ID de usuario, filtramos por ese usuario ---
        if (usuarioIdFiltro) {
            filtro.usuario = usuarioIdFiltro;
        }

        // --- Busca en MongoDB y usa "populate" para traer los datos públicos del creador ---
        let publicaciones = await this.publicacionModel
            .find(filtro)
            .populate('usuario', 'nombre nombreUsuario fotoPerfil')
            .populate('comentarios.usuario', 'nombre nombreUsuario fotoPerfil')
            .sort({ createdAt: -1 }) // Orden por defecto: Fecha (Más nuevas primero)
            .skip(offset)
            .limit(limit)
            .exec();

        // --- Ordenar por likes si se especifica ---
        if (orden === 'likes') {
            publicaciones.sort((a, b) => b.likes.length - a.likes.length);
        }

        return publicaciones;
    }
    // --- 3. Eliminar Publicación (DELETE) ---
    async eliminarPublicacion(idPublicacion: string, usuarioLogeadoId: string, perfilUsuario: string) {
        const publicacion = await this.publicacionModel.findById(idPublicacion);
        
        if (!publicacion) {
            throw new NotFoundException('La publicación no existe');
        }

        // --- Solo el creador de la publicación o un administrador puede eliminarla ---
        if (publicacion.usuario.toString() !== usuarioLogeadoId && perfilUsuario !== 'administrador') {
            throw new UnauthorizedException('No tenés permiso para eliminar este posteo');
        }

        // --- Cambiamos el estado de la publicación a inactiva en lugar de eliminarla físicamente ---
        publicacion.activa = false;
        await publicacion.save();

        return { mensaje: 'Publicación eliminada correctamente' };
    }
    // --- 4. Dar Me Gusta (POST) ---
    async darMeGusta(idPublicacion: string, usuarioId: string) {
        // --- Usamos $addToSet para evitar duplicados en el array de likes ---
        const publicacion = await this.publicacionModel.findByIdAndUpdate(
            idPublicacion,
            { $addToSet: { likes: usuarioId } },
            // --- new: true devuelv el documento actualizado después de la operación ---
            { new: true }
        );

        if (!publicacion) throw new NotFoundException('Publicación no encontrada');
        
        return { mensaje: 'Me gusta agregado', totalLikes: publicacion.likes.length };
    }
    // --- 5. Sacar Me Gusta (DELETE) ---
    async sacarMeGusta(idPublicacion: string, usuarioId: string) {
        // --- $pull para buscar el ID del usuario en el array y eliminarlo ---
        const publicacion = await this.publicacionModel.findByIdAndUpdate(
            idPublicacion,
            { $pull: { likes: usuarioId } },
            { new: true }
        );

        if (!publicacion) throw new NotFoundException('Publicación no encontrada');
        
        return { mensaje: 'Me gusta quitado', totalLikes: publicacion.likes.length };
    }
    // --- 6. Agregar Comentario (POST) ---
    async agregarComentario(idPublicacion: string, usuarioId: string, texto: string) {
        const publicacion = await this.publicacionModel.findByIdAndUpdate(
            idPublicacion,
            // $push agrega el nuevo comentario al final del array
            { $push: { comentarios: { usuario: usuarioId, texto: texto, fecha: new Date() } } },
            { new: true }
        ).populate('comentarios.usuario', 'nombre nombreUsuario fotoPerfil'); // Devolvemos la lista actualizada

        if (!publicacion) throw new NotFoundException('Publicación no encontrada');
        
        return { mensaje: 'Comentario agregado', comentarios: publicacion.comentarios };
    }
// --- 7. Eliminar Comentario (DELETE) ---
    async eliminarComentario(idPublicacion: string, idComentario: string, usuarioId: string, perfilUsuario: string) {
        const publicacion = await this.publicacionModel.findById(idPublicacion);
        if (!publicacion) throw new NotFoundException('Publicación no encontrada');

        // Buscamos el comentario dentro del array para validar autoría
        const comentario = publicacion.comentarios.find(c => (c as any)._id.toString() === idComentario);
        if (!comentario) throw new NotFoundException('Comentario no encontrado');

        // Validación estricta: Solo el dueño del comentario o un administrador pueden borrarlo
        if (comentario.usuario.toString() !== usuarioId && perfilUsuario !== 'administrador') {
            throw new UnauthorizedException('No tenés permiso para eliminar este comentario');
        }

        // Removemos el comentario de manera atómica usando $pull de MongoDB
        const publicacionActualizada = await this.publicacionModel.findByIdAndUpdate(
            idPublicacion,
            { $pull: { comentarios: { _id: idComentario } } },
            { new: true }
        ).populate('comentarios.usuario', 'nombre nombreUsuario fotoPerfil');
        if (!publicacionActualizada) throw new NotFoundException('No se pudo actualizar la publicación');
        return { mensaje: 'Comentario eliminado correctamente', comentarios: publicacionActualizada.comentarios };
    }
}
