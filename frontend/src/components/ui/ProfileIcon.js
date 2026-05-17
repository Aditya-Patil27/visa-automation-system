import React from 'react';
import { useUser } from '../../context/UserContext';

const ProfileIcon = ({ size = 'md', showName = false, className = '' }) => {
    const { user, loading } = useUser();

    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-12 h-12',
    };

    const textSize = {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
    };

    const avatarSize = sizeClasses[size] || sizeClasses.md;
    const nameSize = textSize[size] || textSize.md;

    if (loading || !user) {
        return (
            <div className={`flex items-center gap-3 ${className}`}>
                {showName && (
                    <div className="text-right hidden sm:block">
                        <div className={`h-4 w-20 bg-slate-700 rounded animate-pulse ${nameSize}`}></div>
                        <div className={`h-3 w-32 bg-slate-800 rounded animate-pulse mt-1`}></div>
                    </div>
                )}
                <div className={`${avatarSize} rounded-full bg-primary/20 border border-primary/40 animate-pulse`}></div>
            </div>
        );
    }

    const initials = user.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            {showName && (
                <div className="text-right hidden sm:block">
                    <p className={`${nameSize} font-semibold`}>{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                </div>
            )}
            <div className={`${avatarSize} rounded-full bg-primary/20 border border-primary/40 overflow-hidden flex items-center justify-center`}>
                {initials ? (
                    <span className="text-primary font-bold" style={{ fontSize: size === 'sm' ? '10px' : size === 'lg' ? '16px' : '13px' }}>
                        {initials}
                    </span>
                ) : (
                    <span className="material-symbols-outlined text-primary" style={{ fontSize: size === 'sm' ? '16px' : size === 'lg' ? '28px' : '22px' }}>
                        person
                    </span>
                )}
            </div>
        </div>
    );
};

export default ProfileIcon;
