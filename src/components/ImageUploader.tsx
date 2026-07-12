import React, { useState, useRef } from 'react';
import { Upload, X, CheckCircle, AlertTriangle, Loader2, Link2 } from 'lucide-react';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  className?: string;
  folder?: string;
}

export default function ImageUploader({ value, onChange, label, className = '' }: ImageUploaderProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Client-side ultra-fast lightweight image compression to base64
  const compressToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          // Optimizing dimensions for lightning-fast database persistence & client loading speed
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 600;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(event.target?.result as string);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          // Compress quality to 0.6 for ultra-fast, high performance under 30KB
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.6);
          resolve(compressedDataUrl);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (PNG, JPG, WEBP, etc.)');
      return;
    }

    setError(null);
    setUploading(true);

    try {
      // Instantly compress and convert to lightweight optimized Base64 (100% reliable, zero network timeouts)
      const base64Url = await compressToDataUrl(file);
      onChange(base64Url);
    } catch (err: any) {
      console.error('Error processing image:', err);
      setError('Failed to process image file.');
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

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    if (!urlInput.startsWith('http://') && !urlInput.startsWith('https://') && !urlInput.startsWith('data:')) {
      setError('Please provide a valid image URL (starting with http://, https://, or data:)');
      return;
    }
    setError(null);
    onChange(urlInput.trim());
    setUrlInput('');
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-[10px] font-bold text-gold-500 uppercase tracking-wider">
          {label}
        </label>
      )}

      {/* Mode selectors */}
      {!value && !uploading && (
        <div className="flex gap-2 border-b border-neutral-800 pb-1.5 mb-2">
          <button
            type="button"
            onClick={() => { setActiveTab('upload'); setError(null); }}
            className={`text-[9px] uppercase font-mono tracking-wider px-2 py-1 rounded transition-colors ${
              activeTab === 'upload' 
                ? 'bg-gold-500/10 text-gold-500 border border-gold-500/20 font-bold' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Upload File
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('url'); setError(null); }}
            className={`text-[9px] uppercase font-mono tracking-wider px-2 py-1 rounded transition-colors ${
              activeTab === 'url' 
                ? 'bg-gold-500/10 text-gold-500 border border-gold-500/20 font-bold' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Paste Image URL
          </button>
        </div>
      )}
      
      <div 
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={value || uploading || activeTab === 'url' ? undefined : triggerInput}
        className={`relative border rounded transition-all duration-300 min-h-[140px] flex flex-col items-center justify-center p-4 text-center ${
          value || uploading ? 'border-neutral-800 bg-neutral-900/40' : activeTab === 'upload' ? 'cursor-pointer' : ''
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
            <p className="text-[10px] font-mono tracking-wider uppercase">Processing & Optimizing Image...</p>
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
              <CheckCircle className="w-3.5 h-3.5" /> Image Attached Instantly
            </div>
            
            <button
              type="button"
              onClick={() => onChange('')}
              className="text-[10px] text-gold-500 hover:text-gold-400 underline font-medium cursor-pointer"
            >
              Reset / Change Image
            </button>
          </div>
        ) : activeTab === 'url' ? (
          <form onSubmit={handleUrlSubmit} className="w-full max-w-sm space-y-3" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2 p-1.5 bg-neutral-950 rounded border border-neutral-800">
              <Link2 className="w-4 h-4 text-gold-500 shrink-0 ml-1" />
              <input 
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="bg-transparent border-none text-white text-xs w-full focus:outline-none focus:ring-0 placeholder-gray-600"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-1.5 bg-gold-500 hover:bg-gold-600 text-neutral-950 font-bold text-[10px] uppercase tracking-widest rounded transition-all cursor-pointer inline-flex items-center gap-1"
            >
              Attach Image URL
            </button>
          </form>
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-400">
            <div className="p-2.5 bg-neutral-900 rounded-full border border-neutral-800 text-gold-500">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Drag & drop image here</p>
              <p className="text-[10px] mt-1 text-gray-500">Or click to select from your device (Auto-compressed)</p>
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
