"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../store/auth.store";
import { usePopup } from "@repo/ui";
import { DeleteAccountConfirmation } from "./DeleteAccountConfirmation";
import userHttp from "@/Services/http/user.http";
import { useProfileImageUpload } from "@/composable/useProfileImageUpload";

interface ProfilePopupProps {
    onClose: () => void;
}

export function ProfilePopup({ onClose }: ProfilePopupProps) {
    const { user, setUser } = useAuthStore();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { showPopup, hidePopup } = usePopup();
    const router = useRouter();
    const { uploadProfileImage, uploading } = useProfileImageUpload();
    const [profileImage, setProfileImage] = useState<string | null>(user?.profileImage || null);

    const getInitials = (name: string) => {
        if (!name) return "V";
        const names = name.trim().split(" ");
        if (names.length === 0) return "";
        if (names.length === 1) return names[0] ? names[0].charAt(0).toUpperCase() : "";
        return names[0] && names[1] ? (names[0].charAt(0) + names[1].charAt(0)).toUpperCase() : "";
    };

    const getMemberSince = () => {
        // For now, just show current year - could be enhanced with actual registration date
        return new Date().getFullYear();
    };

    const handlePhotoClick = () => {
        if (!uploading) {
            fileInputRef.current?.click();
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && user?.id) {
            try {
                const updatedUser = await uploadProfileImage(file, user.id);
                if (updatedUser?.profileImage) {
                    setProfileImage(updatedUser.profileImage);
                    setImageVersion(Date.now()); // Force cache-bust for new image
                    // Update user in auth store
                    setUser({ ...user, profileImage: updatedUser.profileImage });
                }
            } catch (error) {
                console.error("Failed to upload profile image:", error);
            }
        }
        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleDeleteAccount = () => {
        onClose(); // Close profile popup first
        showPopup(
            <DeleteAccountConfirmation
                onClose={hidePopup}
                onConfirm={async () => {
                    // Call the API to delete account
                    await userHttp.deleteAccount();

                    // Call logout to clear server-side session
                    try {
                        const authHttp = await import("@/Services/http/auth.http");
                        await authHttp.default.logout();
                    } catch (error) {
                        console.warn("Logout call failed (account already deleted):", error);
                    }

                    // Clear local auth state
                    localStorage.removeItem("accessToken");
                    localStorage.removeItem("refreshToken");
                    localStorage.removeItem("authUser");

                    // Clear cookies
                    document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                    document.cookie = "refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

                    setUser(null);
                    hidePopup();

                    // Force redirect with full page reload
                    window.location.href = "/login";
                }}
            />
        );
    };

    // Build image URL with cache-busting parameter
    const [imageVersion, setImageVersion] = useState(Date.now());

    const getImageUrl = (imagePath: string | null) => {
        if (!imagePath) return null;

        const storageUrl = process.env.NEXT_PUBLIC_STORAGE_URL || "http://localhost:9000/casashopping";

        if (imagePath.startsWith("http")) {
            if (imagePath.includes("localhost:9000")) {
                try {
                    const storageUrlObj = new URL(storageUrl);
                    // Replace http://localhost:9000 with the new origin
                    const newUrl = imagePath.replace("http://localhost:9000", storageUrlObj.origin);
                    return `${newUrl}?v=${imageVersion}`;
                } catch (e) {
                    return `${imagePath}?v=${imageVersion}`;
                }
            }
            return `${imagePath}?v=${imageVersion}`;
        }

        const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
        return `${storageUrl}/${cleanPath}?v=${imageVersion}`;
    };

    const imageUrl = getImageUrl(profileImage);

    return (
        <div className="relative md:w-[420px] w-[350px] bg-white max-w-md rounded-3xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-primary px-6 py-4 flex items-center justify-between">
                <h3 className="text-white font-bold text-lg">Meu Perfil</h3>
                <button
                    onClick={onClose}
                    className="text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M18 6 6 18"></path>
                        <path d="m6 6 12 12"></path>
                    </svg>
                </button>
            </div>

            {/* Content */}
            <div className="p-8 flex flex-col items-center gap-6">
                {/* Avatar with edit button */}
                <div className="relative group">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-100 shadow-lg flex items-center justify-center bg-gray-200">
                        {imageUrl ? (
                            <img
                                src={imageUrl}
                                alt="Foto de perfil"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-primary text-4xl font-bold">
                                {getInitials(user?.name || "Visitante")}
                            </span>
                        )}
                        {uploading && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full">
                                <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handlePhotoClick}
                        disabled={uploading}
                        className="absolute bottom-0 right-0 bg-primary text-white p-2.5 rounded-full shadow-lg hover:bg-primary/90 transition-colors hover:scale-105 active:scale-95 border-2 border-white disabled:opacity-50"
                        title="Alterar foto"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z"></path>
                            <circle cx="12" cy="13" r="3"></circle>
                        </svg>
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                </div>

                {/* User Info */}
                <div className="text-center w-full space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nome</label>
                        <p className="text-xl font-semibold text-[#162e47]">{user?.name || "Visitante"}</p>
                    </div>
                    <div className="w-full h-px bg-gray-100"></div>
                    <div className="bg-blue-50 p-4 rounded-xl text-sm text-primary font-medium">
                        Membro desde {getMemberSince()}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <button
                    onClick={handleDeleteAccount}
                    className="text-xs font-medium text-gray-400 hover:text-red-500 transition-colors"
                >
                    Deletar conta
                </button>
                <button
                    onClick={onClose}
                    className="px-6 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-100 hover:text-gray-900 transition-colors"
                >
                    Fechar
                </button>
            </div>
        </div>
    );
}
