import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

// --- Esto permite que NestJS reconozca la clase como un documento de MongoDB ---
export type UsuarioDocument = Usuario;

@Schema({ timestamps: true }) // 'timestamps' agrega columnas 'createdAt' y 'updatedAt'
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
    fotoPerfil!: string; // URL de Cloudinary

    @Prop({required:true})
    fechaNacimiento!: string;

    @Prop({ default: '' })
    descripcion!: string;
    // --- Campos Administrativos  ---
    @Prop({ default: true })
    activo!: boolean; // Sirve para dar de baja sin borrar 

    @Prop({ default: 'usuario', enum: ['usuario', 'admin'] })
    rol!: string; 
}

// --- Gener el esquema oficial de Mongoose a partir de la clase de arriba ---
export const UsuarioSchema = SchemaFactory.createForClass(Usuario);