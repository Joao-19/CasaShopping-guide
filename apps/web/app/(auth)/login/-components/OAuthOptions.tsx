
'use client';

import { Button } from "@repo/ui/button";

interface OAuthOptionsProps {
    onGoogleClick?: () => void;
    onFacebookClick?: () => void;
    onAppleClick?: () => void;
}

export const OAuthOptions = ({
    onGoogleClick,
    onFacebookClick,
    onAppleClick
}: OAuthOptionsProps) => {
    return (
        <div className="flex gap-3 mb-6">
            <Button
                variant="outline"
                className="flex-1 h-11 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                onClick={() => onAppleClick ? onAppleClick() : null}
                title="Entrar com Apple"
                type="button"
            >
                <svg viewBox="0 0 384 512" className="w-5 h-5 fill-current text-black">
                    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 46.9 126.7 98 126.7 32.3 0 52.8-25.8 86.8-25.8 32.2 0 49.3 25.4 83.2 25.4 39.3 0 65-42.3 65-42.3-51.4-23.7-67.6-67.6-72.7-82.9z" />
                </svg>
            </Button>

            <Button
                variant="outline"
                className="flex-1 h-11 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                onClick={() => onGoogleClick ? onGoogleClick() : null}
                title="Entrar com Google"
                type="button"
            >
                <svg viewBox="0 0 24 24" className="w-5 h-5">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
            </Button>

            <Button
                variant="outline"
                className="flex-1 h-11 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                onClick={() => onFacebookClick ? onFacebookClick() : null}
                title="Entrar com Facebook"
                type="button"

            >
                <svg viewBox="0 0 24 24" className="w-6 h-6 fill-blue-600">
                    <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.88c0-2.474 1.283-4.468 4.718-4.468 1.181 0 2.228.087 2.228.087v3.072h-1.63c-1.256 0-1.748.791-1.748 1.95v1.239h2.956l-.583 3.667h-2.373v7.98h-3.57z" />
                </svg>
            </Button>
        </div>
    );
};
