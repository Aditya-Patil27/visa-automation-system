import React from 'react';
import { Link } from 'react-router-dom';

const VARIANTS = {
  primary: 'bg-primary text-background-dark font-bold hover:shadow-[0_6px_20px_rgba(13,204,242,0.23)]',
  secondary: 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20',
  ghost: 'text-slate-400 hover:text-primary',
  danger: 'bg-red-500/10 text-red-400 hover:bg-red-500/20',
  success: 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20',
  icon: 'p-2 text-slate-400 hover:text-primary transition-colors',
  chip: 'px-4 py-2 rounded-full border border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary text-xs font-semibold transition-all',
  nav: 'flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-primary/5 transition-colors text-slate-600 dark:text-slate-400',
  navActive: 'flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 text-primary font-medium transition-colors',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-8 py-4 text-base rounded-xl',
};

const Button = ({ variant = 'primary', size = 'md', icon, children, to, href, onClick, disabled, className, active, ...props }) => {
  const base = variant === 'chip' ? VARIANTS.chip : `${VARIANTS[variant] || VARIANTS.primary} ${SIZES[size]}`;
  const stateClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
  const activeClass = variant === 'nav' && active ? VARIANTS.navActive : '';
  const classes = `inline-flex items-center justify-center gap-2 transition-all ${base} ${stateClasses} ${activeClass} ${className || ''}`;

  if (to) return <Link to={to} className={classes} {...props}>{icon && <span className="material-symbols-outlined">{icon}</span>}{children}</Link>;
  if (href) return <a href={href} className={classes} {...props}>{icon && <span className="material-symbols-outlined">{icon}</span>}{children}</a>;
  return <button className={classes} onClick={onClick} disabled={disabled} {...props}>{icon && <span className="material-symbols-outlined">{icon}</span>}{children}</button>;
};

export const IconButton = ({ icon, onClick, className, ...props }) => (
  <button onClick={onClick} className={`p-2 text-slate-400 hover:text-primary transition-colors ${className || ''}`} {...props}>
    <span className="material-symbols-outlined">{icon}</span>
  </button>
);

export const Badge = ({ children, variant = 'default' }) => {
  const map = {
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    danger: 'bg-red-500/10 text-red-400 border-red-500/20',
    info: 'bg-primary/10 text-primary border-primary/20',
    default: 'bg-slate-800 text-slate-400 border-slate-700',
  };
  return <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${map[variant] || map.default}`}>{children}</span>;
};

export default Button;
