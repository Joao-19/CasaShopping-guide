import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableImageProps {
    id: string;
    preview: string;
    index: number;
    onRemove: () => void;
    isVideo?: boolean;
}

// Helper to detect if a URL is a video
const isVideoUrl = (url: string): boolean => {
    const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.mkv'];
    const lowerUrl = url.toLowerCase();
    // Check for video extensions or data:video MIME type
    return videoExtensions.some(ext => lowerUrl.includes(ext)) ||
        lowerUrl.startsWith('data:video/');
};

export function SortableImage({ id, preview, index, onRemove, isVideo = false }: SortableImageProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.5 : 1,
    };

    // Use the isVideo prop passed from parent, or detect from URL for remote files
    const showAsVideo = isVideo || isVideoUrl(preview);

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="relative aspect-square rounded-lg border border-gray-200 overflow-hidden group bg-gray-50 cursor-grab active:cursor-grabbing hover:border-[#1A2B3C] transition-colors"
        >
            {showAsVideo ? (
                <video
                    src={preview}
                    className="object-cover w-full h-full pointer-events-none"
                    muted
                    loop
                    autoPlay
                    playsInline
                />
            ) : (
                <img
                    src={preview}
                    alt={`Produto ${index + 1}`}
                    className="object-cover w-full h-full pointer-events-none"
                />
            )}
            {/* Video indicator badge */}
            {showAsVideo && (
                <div className="absolute top-1 left-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    Vídeo
                </div>
            )}
            {/* Remove Button */}
            <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                }}
                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
            </button>
            {/* Index Badge */}
            <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
                #{index + 1}
            </div>
        </div>
    );
}

