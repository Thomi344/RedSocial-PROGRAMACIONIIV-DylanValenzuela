import { Injectable, NotFoundException, UnauthorizedException,BadRequestException,ForbiddenException } from '@nestjs/common';
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
    // --- orden: 'fecha' o 'likes', offset y limit para paginación, usuarioId para filtrar por "Mi Perfil" ---
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
    // --- Obtener Una Publicación (GET) ---
    async obtenerPublicacionPorId(id: string) {
        const publicacion = await this.publicacionModel.findById(id)
            .populate('usuario', 'nombre nombreUsuario fotoPerfil')
            .populate('comentarios.usuario', 'nombre nombreUsuario fotoPerfil')
            .exec();
            
        if (!publicacion) throw new NotFoundException('Publicación no encontrada');
        return publicacion;
    }
    // --- 3. Eliminar Publicación (DELETE) ---
    async eliminarPublicacion(idPublicacion: string, usuarioLogeadoId: string, perfilUsuario: string) {
        const publicacion = await this.publicacionModel.findById(idPublicacion);
        
        if (!publicacion) {
            throw new NotFoundException('La publicación no existe');
        }
        const esAdmin = perfilUsuario === 'admin';
        // --- Solo el creador de la publicación o un administrador puede eliminarla ---
        if (publicacion.usuario.toString() !== usuarioLogeadoId && usuarioLogeadoId && !esAdmin) {
            throw new ForbiddenException('No tenés permiso para eliminar este posteo');
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
        const esAdmin = perfilUsuario === 'admin';
        if (comentario.usuario.toString() !== usuarioId && !esAdmin) {
            throw new ForbiddenException('No tenés permiso para eliminar este comentario');
        }

        // Removemos el comentario usando $pull de Mongo
        const publicacionActualizada = await this.publicacionModel.findByIdAndUpdate(
            idPublicacion,
            { $pull: { comentarios: { _id: idComentario } } },
            { new: true }
        ).populate('comentarios.usuario', 'nombre nombreUsuario fotoPerfil');
        if (!publicacionActualizada) throw new NotFoundException('No se pudo actualizar la publicación');
        return { mensaje: 'Comentario eliminado correctamente', comentarios: publicacionActualizada.comentarios };
    }
// --- 8. Obtener Comentarios Paginados (GET) ---
// --- paginación de comentarios en la vista de una publicación ---
    async obtenerComentariosPaginados(idPublicacion: string, pagina: number, limite: number) {
        const publicacion = await this.publicacionModel
            .findById(idPublicacion)
            .populate('comentarios.usuario', 'nombre nombreUsuario fotoPerfil')
            .exec();

        if (!publicacion) throw new NotFoundException('Publicación no encontrada');

        // Ordenamos los comentarios del más reciente al más antiguo como pide la rúbrica
        const comentariosOrdenados = publicacion.comentarios.sort((a: any, b: any) => b.fecha - a.fecha);

        // Calculamos los índices para recortar el array simulando una paginación
        const inicio = (pagina - 1) * limite;
        const fin = inicio + limite;
        const comentariosPaginados = comentariosOrdenados.slice(inicio, fin);

        return {
            mensaje: 'Comentarios obtenidos correctamente',
            total: comentariosOrdenados.length,
            comentarios: comentariosPaginados
        };
    }

// --- 9. Modificar Comentario (PUT) ---
    async modificarComentario(idPublicacion: string, idComentario: string, usuarioId: string, nuevoTexto: string) {
        // --- el operador posicional $ para actualizar solo el comentario específico ---
        const publicacionActualizada = await this.publicacionModel.findOneAndUpdate(
            { 
                _id: idPublicacion, 
                "comentarios._id": idComentario, 
                "comentarios.usuario": usuarioId // Validación estricta: solo el autor puede editar
            },
            {
                $set: {
                    "comentarios.$.texto": nuevoTexto,
                    "comentarios.$.modificado": true //  marcarlo como editado
                }
            },
            { new: true }
        ).populate('comentarios.usuario', 'nombre nombreUsuario fotoPerfil');

        if (!publicacionActualizada) {
            throw new BadRequestException('No se pudo editar el comentario. O no existe, o no tenés permiso.');
        }

        return { mensaje: 'Comentario modificado correctamente', comentarios: publicacionActualizada.comentarios };
    }
    // === Estadísticas ===
// --- 10. Cuenta cuántas publicaciones hizo cada usuario en un rango de fechas ---
    async contarPublicacionesPorUsuario(inicio: string, fin: string) {
        const fechaInicio = new Date(inicio);
        const fechaFin = new Date(fin);
        // --- Ajustamos la hora de fin para incluir todo el día hasta las 23:59:59.999 ---
        fechaFin.setHours(23, 59, 59, 999); 

        return await this.publicacionModel.aggregate([
            {
                $match: {
                    activa: true,
                    createdAt: { $gte: fechaInicio, $lte: fechaFin }
                }
            },
            {
                $group: {
                    _id: '$usuario', // Agrupamos por la referencia del usuario
                    cantidad: { $sum: 1 }
                }
            },
            { $addFields: { usuarioIdObj: { $toObjectId: '$_id' } } },
            // --- Lookup para traer los datos del usuario desde la colección de usuarios ---
            {
                $lookup: {
                    from: 'usuarios',
                    localField: 'usuarioIdObj',
                    foreignField: '_id',
                    as: 'usuarioInfo'
                }
            },
            { $unwind: '$usuarioInfo' },
            {
                $project: {
                    _id: 0,
                    nombreUsuario: '$usuarioInfo.nombreUsuario',
                    cantidad: 1
                }
            }
        ]);
    }

// --- Gráfico 2: Cuenta cuántos comentarios se hicieron en ese rango de fechas ---
    async contarComentariosTotales(inicio: string, fin: string) {
        const fechaInicio = new Date(inicio);
        const fechaFin = new Date(fin);
        fechaFin.setHours(23, 59, 59, 999);

        const resultado = await this.publicacionModel.aggregate([
            { $match: { activa: true } },
            { $unwind: '$comentarios' }, // Desarmamos el array de comentarios
            {
                $match: {
                    'comentarios.fecha': { $gte: fechaInicio, $lte: fechaFin }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 }
                }
            }
        ]);

        return { totalComentarios: resultado[0]?.total || 0 };
    }

// --- Gráfico 3: Cuenta cuántos comentarios tiene cada publicación en ese rango de fechas ---
    async contarComentariosPorPublicacion(inicio: string, fin: string) {
        const fechaInicio = new Date(inicio);
        const fechaFin = new Date(fin);
        fechaFin.setHours(23, 59, 59, 999);

        return await this.publicacionModel.aggregate([
            { $match: { activa: true } },
            { $unwind: '$comentarios' },
            {
                $match: {
                    'comentarios.fecha': { $gte: fechaInicio, $lte: fechaFin }
                }
            },
            {
                $group: {
                    _id: '$_id',
                    titulo: { $first: '$titulo' },
                    cantidadComentarios: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    titulo: 1,
                    cantidadComentarios: 1
                }
            }
    ]);
}
}
