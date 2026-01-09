import Link from "next/link";

interface AdvertisementBannerProps {
    src: string;
    type?: "image" | "video";
    alt?: string;
    link?: string;
    className?: string;
    withoutWrapper?: boolean;
    displayMode?: 'mobile' | 'desktop' | 'all';
}

export function AdvertisementBanner({
    src,
    type = "image",
    alt = "Advertisement",
    link,
    className = "",
    withoutWrapper = false,
    displayMode = 'all'
}: AdvertisementBannerProps) {

    // Auto-detect video if not specified
    const isVideo = type === "video" || src.endsWith('.mp4') || src.endsWith('.webm');

    // Visibility classes
    const visibilityClass = displayMode === 'mobile' ? 'block md:hidden' :
        displayMode === 'desktop' ? 'hidden md:block' :
            'block';

    const content = (
        <div className={`w-full relative rounded-2xl overflow-hidden shadow-sm aspect-32/9 max-w-[1920px] max-h-[180px] ${className}`}>
            {isVideo ? (
                <video
                    src={src}
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                />
            ) : (
                <img
                    src={src}
                    alt={alt}
                    className="w-full h-full object-cover"
                    loading="lazy"
                />
            )}
            {/* Overlay for better clicking indication if it is a link */}
            {link && <div className="absolute inset-0 bg-black/0 hover:bg-black/5 transition-colors duration-300" />}
        </div>
    );

    if (withoutWrapper) {
        const wrapperClass = `w-full mt-8 md:mt-12 ${visibilityClass}`;

        if (link) {
            return (
                <Link href={link} className={`transition-transform hover:scale-[1.01] active:scale-[0.99] duration-300 ${wrapperClass}`}>
                    {content}
                </Link>
            )
        }
        return <div className={wrapperClass}>{content}</div>;
    }

    if (link) {
        return (
            <div className={`max-w-7xl mx-auto px-4 md:px-8 mt-8 md:mt-12 ${visibilityClass}`}>
                <Link href={link} className="block transition-transform hover:scale-[1.01] active:scale-[0.99] duration-300 w-full">
                    {content}
                </Link>
            </div>
        )
    }

    return (
        <div className={`max-w-7xl mx-auto px-4 md:px-8 mt-8 md:mt-12 w-full ${visibilityClass}`}>
            {content}
        </div>
    );
}
