import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

// --- Esto permite que NestJS reconozca la clase como un documento de MongoDB ---
export type UsuarioDocument = Usuario;

@Schema({ timestamps: true }) // 'timestamps' agrega automaticamente las columnas 'createdAt' y 'updatedAt'
export class Usuario {
    @Prop({ required: true, trim: true })
    nombre!: string;
    @Prop({ required: true, unique: true })
    nombreUsuario!: string;
    @Prop({ required: true, unique: true, lowercase: true, trim: true })
    email!: string;

    @Prop({ required: true })
    contrasena!: string;

    @Prop({ default: '' })
    fotoPerfil!: string; // Aca va a impactar la URL de Cloudinary
}

// --- Gener el esquema oficial de Mongoose a partir de la clase de arriba ---
export const UsuarioSchema = SchemaFactory.createForClass(Usuario);