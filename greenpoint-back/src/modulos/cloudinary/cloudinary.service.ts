import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { Readable } from 'stream';
import 'multer'; // <-- 1. Esto le enseña a TypeScript qué es Express.Multer

@Injectable()
export class CloudinaryService {
    uploadImage(file: Express.Multer.File): Promise<UploadApiResponse | UploadApiErrorResponse> {
        return new Promise((resolve, reject) => {
        const upload = cloudinary.uploader.upload_stream(
            { folder: 'greenpoint_usuarios' }, 
            (error, result) => {
            if (error) return reject(error);
            
            // 2. Le asegura a TypeScript que "result" existe antes de devolverlo
            if (result) return resolve(result); 
            },
        );
        Readable.from(file.buffer).pipe(upload);
        });
    }
}