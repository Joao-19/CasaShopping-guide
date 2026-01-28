'use client';

import React, { useState, useRef } from 'react';
import { BaseText } from '../Texts/BaseText';

interface ImageUploadProps {
    variant?: 'profile' | 'card';
    label?: string;
    onImageSelect?: (file: File) => void;
    currentImage?: string;
    className?: string;
}

export function ImageUpload({
    variant = 'profile',
    label = 'Upload Image',
    onImageSelect,
    currentImage,
    className = ''
}: ImageUploadProps) {
    const [preview, setPreview] = useState<string | null>(currentImage || null);
    const [isVideo, setIsVideo] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        setPreview(currentImage || null);
    }, [currentImage]);

    const handleFile = (file: File) => {
        const isImageFile = file.type.startsWith('image/');
        const isVideoFile = file.type.startsWith('video/');

        if (!isImageFile && !isVideoFile) {
            alert('Por favor envie apenas imagens ou vídeos.');
            return;
        }

        // Block GIFs specifically
        if (file.type === 'image/gif') {
            alert('GIFs não são permitidos. Por favor envie apenas imagens estáticas (JPG, PNG, WebP) ou vídeos.');
            return;
        }

        setIsVideo(isVideoFile);

        const reader = new FileReader();
        reader.onload = (e) => {
            setPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
        if (onImageSelect) onImageSelect(file);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        setPreview(null);
        setIsVideo(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const allowedTypes = "image/jpeg, image/png, image/webp, image/bmp, video/mp4, video/webm, video/quicktime";

    const renderPreview = () => {
        if (!preview) return null;

        if (isVideo) {
            return (
                <video
                    src={preview}
                    className="w-full h-full object-cover"
                    muted
                    loop
                    autoPlay
                    playsInline
                />
            );
        }
        return <img src={preview} alt="Preview" className="w-full h-full object-cover" />;
    };

    if (variant === 'profile') {
        return (
            <div className={`flex flex-col items-center justify-center ${className}`}>
                <div
                    onClick={handleClick}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`
                        relative w-24 h-24 rounded-full flex items-center justify-center cursor-pointer 
                        transition-all duration-200 overflow-hidden group
                        ${preview ? 'border-0' : 'bg-gray-50 border-2 border-dashed'}
                        ${isDragging ? 'border-[#1A2B3C] bg-blue-50' : 'border-gray-300 hover:border-[#1A2B3C] hover:bg-gray-100'}
                    `}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={allowedTypes}
                        onChange={handleChange}
                        className="hidden"
                    />

                    {preview ? (
                        <>
                            {renderPreview()}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-camera text-white">
                                    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path>
                                    <circle cx="12" cy="13" r="3"></circle>
                                </svg>
                            </div>
                        </>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-cloud-upload text-gray-400">
                            <path d="M12 13v8"></path>
                            <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path>
                            <path d="m8 17 4-4 4 4"></path>
                        </svg>
                    )}
                </div>
                {label && (
                    <BaseText
                        text={label}
                        size="small"
                        color="gray"
                        className="text-center mt-2"
                    />
                )}
            </div>
        );
    }

    // Card variant
    return (
        <div className={`w-full ${className}`}>
            {label && (
                <BaseText
                    text={label}
                    size="small"
                    color="gray"
                    className="mb-1.5 font-semibold text-gray-700"
                />
            )}
            <div
                onClick={handleClick}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                    relative w-full h-48 rounded-xl flex flex-col items-center justify-center cursor-pointer 
                    transition-all duration-200 overflow-hidden group
                    ${preview ? 'border-0' : 'bg-gray-50 border-2 border-dashed'}
                    ${isDragging ? 'border-[#1A2B3C] bg-blue-50' : 'border-gray-300 hover:border-[#1A2B3C] hover:bg-gray-100'}
                `}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={allowedTypes}
                    onChange={handleChange}
                    className="hidden"
                />

                {preview ? (
                    <>
                        {renderPreview()}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                            <button className="text-white p-2 rounded-full hover:bg-white/20 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-refresh-cw">
                                    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                                    <path d="M21 3v5h-5"></path>
                                    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                                    <path d="M8 16H3v5"></path>
                                </svg>
                            </button>
                            <button onClick={handleRemove} className="text-white p-2 rounded-full hover:bg-white/20 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2">
                                    <path d="M3 6h18"></path>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                                    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    <line x1="10" x2="10" y1="11" y2="17"></line>
                                    <line x1="14" x2="14" y1="11" y2="17"></line>
                                </svg>
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-image-plus text-[#1A2B3C]">
                                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"></path>
                                <line x1="16" x2="22" y1="5" y2="5"></line>
                                <line x1="19" x2="19" y1="2" y2="8"></line>
                                <circle cx="9" cy="9" r="2"></circle>
                                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
                            </svg>
                        </div>
                        <BaseText
                            text="Clique ou arraste a imagem/vídeo"
                            size="small"
                            color="gray"
                            className="font-medium text-gray-700 text-center"
                        />
                        <BaseText
                            text="PNG, JPG, WebP, MP4, WebM"
                            size="small"
                            color="gray"
                            className="text-center mt-1"
                        />
                    </>
                )}
            </div>
        </div>
    );
}

