import React from 'react';
import { Icon, type IconName } from './Icon';

type Variant = 'primary' | 'gold' | 'lime' | 'cyan' | 'danger' | 'outline' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

type Common = {
    variant?: Variant;
    size?: Size;
    block?: boolean;
    /** Icon on the left. */
    icon?: IconName;
    /** Icon on the right; defaults to an arrow for ghost buttons. */
    iconRight?: IconName;
    /** Key hint rendered after the label, e.g. "ENTER". */
    kbd?: string;
    className?: string;
    children?: React.ReactNode;
};
type AnchorProps = Common & { href: string; external?: boolean } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'className' | 'children'>;
type ButtonProps = Common & { href?: undefined; external?: undefined } & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'>;

/** Chamfered, glowing call-to-action. Renders an <a> when `href` is given, a <button> otherwise. */
export const Button: React.FC<AnchorProps | ButtonProps> = (props) => {
    const { variant = 'primary', size = 'md', block, icon, iconRight, kbd, className = '', children } = props;
    const right = iconRight ?? (variant === 'ghost' ? 'arrowRight' : undefined);
    const cls = ['btn', variant !== 'primary' ? `btn--${variant}` : '', size !== 'md' ? `btn--${size}` : '', block ? 'btn--block' : '', className].filter(Boolean).join(' ');
    const inner = (
        <>
            {icon && <Icon name={icon} size={16} />}
            <span>{children}</span>
            {right && <span className="btn__arrow"><Icon name={right} size={16} /></span>}
            {kbd && <kbd className="btn__kbd">{kbd}</kbd>}
        </>
    );
    if (props.href !== undefined) {
        const { href, external, variant: _v, size: _s, block: _b, icon: _i, iconRight: _ir, kbd: _k, className: _c, children: _ch, ...rest } = props;
        const ext = external ?? /^https?:\/\//.test(href);
        return (
            <a href={href} className={cls} {...(ext ? { target: '_blank', rel: 'noopener noreferrer' } : {})} {...rest}>
                {inner}
            </a>
        );
    }
    const { href: _h, external: _e, variant: _v, size: _s, block: _b, icon: _i, iconRight: _ir, kbd: _k, className: _c, children: _ch, type, ...rest } = props;
    return (
        <button type={type ?? 'button'} className={cls} {...rest}>
            {inner}
        </button>
    );
};
