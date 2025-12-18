'use client';

export const UnloggedFooter = () => {
    return (
        <div className="w-full text-center pointer-events-none mt-auto shrink-0">
            <p className="text-white/60 text-[10px] tracking-widest uppercase">
                CasaShopping © {new Date().getFullYear()}
            </p>
        </div>
    );
};
