'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import api from '../../lib/api';

interface ImageUploadProps {
  onImagesChange: (urls: string[]) => void;
  maxImages?: number;
  currentImages?: string[];
  folder?: 'products' | 'documents' | 'courses';
}

export default function ImageUpload({ 
  onImagesChange, 
  maxImages = 10, 
  currentImages = [],
  folder = 'products',
}: ImageUploadProps) {
  const [images, setImages] = useState<string[]>(currentImages);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (images.length + acceptedFiles.length > maxImages) {
      alert(`Máximo ${maxImages} imágenes permitidas`);
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < acceptedFiles.length; i++) {
        const file = acceptedFiles[i];
        const formData = new FormData();
        // IMPORTANTE: El nombre del campo debe coincidir con el backend
          if (folder === 'products'|| folder === 'courses') {
            formData.append('files', file); // Para múltiples archivos
          } else {
            formData.append('file', file); // Para archivo único
          }
          

        const endpoint = folder === 'products'|| folder === 'courses' ? '/upload/product-images' : '/upload/image';
        const response = await api.post(endpoint, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (Array.isArray(response.data)) {
          uploadedUrls.push(...response.data.map((img: any) => img.url));
        } else {
          uploadedUrls.push(response.data.url);
        }

        setUploadProgress(Math.round(((i + 1) / acceptedFiles.length) * 100));
      }

      const newImages = [...images, ...uploadedUrls];
      setImages(newImages);
      onImagesChange(newImages);
    } catch (error: any) {
      console.error('Error uploading images:', error);
      alert(error.response?.data?.message || 'Error al subir imágenes');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [images, maxImages, onImagesChange, folder]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    disabled: uploading || images.length >= maxImages,
  });

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      {images.length < maxImages && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${
            isDragActive
              ? 'border-amber-500 bg-amber-500 bg-opacity-10'
              : 'border-slate-700 hover:border-amber-500 bg-slate-900'
          } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} />
          <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          {uploading ? (
            <div>
              <p className="text-white mb-2">Subiendo imágenes...</p>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className="bg-amber-600 h-2 rounded-full transition-all"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-white mb-2">
                {isDragActive
                  ? 'Suelta las imágenes aquí'
                  : 'Arrastra imágenes aquí o haz clic para seleccionar'}
              </p>
              <p className="text-slate-400 text-sm">
                Máximo {maxImages} imágenes • JPEG, PNG, WebP • Máx. 5MB cada una
              </p>
            </div>
          )}
        </div>
      )}

      {/* Preview de imágenes */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`Imagen ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border border-slate-700"
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
              {index === 0 && (
                <div className="absolute bottom-2 left-2 bg-amber-600 text-white text-xs px-2 py-1 rounded">
                  Principal
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {images.length > 0 && (
        <p className="text-slate-400 text-sm">
          {images.length} de {maxImages} imágenes subidas
        </p>
      )}
    </div>
  );
}