import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  className?: string;
  folder?: string;
}

export default function ImageUploader({ value, onChange, label, className = '', folder = 'general' }: ImageUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (PNG, JPG, WEBP, etc.)');
      return;
    }

    // Size limit of 5MB for Firebase Storage
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size is too large. Please select an image under 5MB.');
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
      const uniqueFileName = `${Date.now()}_${cleanFileName}`;
      const storageRef = ref(storage, `${folder}/${uniqueFileName}`);
      
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      onChange(downloadURL);
    } catch (err: any) {
      console.error('Error uploading to Firebase Storage:', err);
      setError(err?.message || 'Failed to upload image to Firebase Storage.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const triggerInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && <label className="block text-[10px] font-bold text-gold-500 uppercase tracking-wider">{label}</label>}
      
      <div 
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={value || uploading ? undefined : triggerInput}
        className={`relative border rounded transition-all duration-300 min-h-[140px] flex flex-col items-center justify-center p-4 text-center ${
          value || uploading ? 'border-neutral-800 bg-neutral-900/40' : 'cursor-pointer'
        } ${
          dragActive 
            ? 'border-gold-500 bg-gold-500/10' 
            : value 
              ? 'border-neutral-800' 
              : 'border-dashed border-neutral-700 hover:border-gold-500/60 hover:bg-neutral-900/20'
        }`}
      >
        <input 
          ref={fileInputRef}
          type="file" 
          className="hidden" 
          accept="image/*" 
          disabled={uploading}
          onChange={handleChange} 
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-3 text-gold-500">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-[10px] font-mono tracking-wider uppercase">Uploading to Firebase Storage...</p>
          </div>
        ) : value ? (
          <div className="w-full h-full flex flex-col items-center gap-3">
            <div className="relative group w-32 h-20 rounded overflow-hidden border border-neutral-800 shadow-md">
              <img 
                src={value} 
                alt="Uploaded preview" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange('');
                }}
                className="absolute top-1 right-1 p-1 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors shadow"
                title="Remove image"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            
            <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-semibold tracking-wider uppercase">
              <CheckCircle className="w-3.5 h-3.5" /> Uploaded to Storage
            </div>
            
            <button
              type="button"
              onClick={triggerInput}
              className="text-[10px] text-gold-500 hover:text-gold-400 underline font-medium cursor-pointer"
            >
              Replace Image
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-400">
            <div className="p-2.5 bg-neutral-900 rounded-full border border-neutral-800 text-gold-500">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Drag & drop image here</p>
              <p className="text-[10px] mt-1 text-gray-500">Or click to select from your device (Max 5MB)</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-1.5 p-2 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] rounded">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
