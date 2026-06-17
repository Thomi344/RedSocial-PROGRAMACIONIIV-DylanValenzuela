import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document,Types} from 'mongoose';
import {Usuario} from '../../usuarios/entidades/usuario.schema';

export type PublicacionDocument = Publicacion & Document;

@Schema({timestamps: true})
export class Publicacion{

    // --- Referencia al usuario que creó la publicación ---
    @Prop({ type: Types.ObjectId, ref: 'Usuario', required: true })
    usuario!: Usuario | Types.ObjectId;

    @Prop({ required: true })
    titulo!: string;

    @Prop({ required: true })
    descripcion!: string;

    // --- URL de la imagen asociada a la publicación (opcional) ---
    @Prop({ default: '' })
    imagen!: string;

    // --- Para los "likes", almacenaun array de IDs de usuarios que han dado like a la publicación ---
    @Prop({ type: [{ type: Types.ObjectId, ref: 'Usuario' }], default: [] })
    likes!: Types.ObjectId[];
    @Prop({
        type: [{
        usuario: { type: Types.ObjectId, ref: 'Usuario' },
        texto: { type: String, required: true },
        fecha: { type: Date, default: Date.now }
        }],
        default: []
    })
    comentarios!: { usuario: Types.ObjectId, texto: string, fecha: Date }[];
    
    @Prop({ default: true })
    activa!: boolean;
}

export const PublicacionSchema = SchemaFactory.createForClass(Publicacion);