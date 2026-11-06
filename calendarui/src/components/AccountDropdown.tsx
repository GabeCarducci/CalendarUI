import type { User } from '@auth0/auth0-react';
import { useEffect, useId, useRef, useState } from 'react';

const itemClass = 'flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left';

export default function AccountDropdown({ user }: { user?: User }) {
  const name = user?.name || user?.nickname || 'Account';
  const menuId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    function handleOutsidePointer(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;
      setIsOpen(false);
      if (containerRef.current?.contains(document.activeElement)) {
        triggerRef.current?.focus();
      }
    }

    document.addEventListener('pointerdown', handleOutsidePointer);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('pointerdown', handleOutsidePointer);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative min-w-0 text-left">
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={isOpen}
        aria-controls={menuId}
        onClick={() => {
          setShowProfile(false);
          setIsOpen(!isOpen);
        }}
        className="flex w-64 max-w-full cursor-pointer items-center gap-3 rounded-lg bg-[#203e32] px-2.5 py-1.5 text-sm font-medium text-zinc-100 hover:bg-[#315c49] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
      >
        <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-full border border-white/25 bg-white/10 text-white">
          {name.charAt(0).toUpperCase()}
        </span>
        <span className="min-w-0 flex-1 truncate text-left">{name}</span>
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isOpen ? 'size-4 shrink-0 rotate-180' : 'size-4 shrink-0'}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      <div id={menuId} hidden={!isOpen} className="absolute top-full left-0 z-50 mt-2 w-64 max-w-[calc(100vw-2.5rem)] rounded-xl border border-[#315c49] bg-[#203e32] text-sm text-zinc-100 shadow-xl">
        <p className="break-words border-b border-white/20 px-4 py-3 font-semibold">{name}</p>
        <div className="p-1">
          <button
            type="button"
            aria-expanded={showProfile}
            onClick={() => setShowProfile(!showProfile)}
            className={`${itemClass} cursor-pointer hover:bg-[#315c49] focus-visible:outline-2 focus-visible:outline-sky-400`}
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-5 shrink-0">
              <rect x="3" y="3" width="18" height="18" rx="6" />
              <circle cx="12" cy="10" r="2.5" />
              <path d="M6.5 19v-1a3 3 0 0 1 3-3h5a3 3 0 0 1 3 3v1" />
            </svg>
            Profile
          </button>
          {showProfile && (
            <div className="px-4 py-2 text-sm break-words text-zinc-300">
              {user?.email || 'No email available'}
            </div>
          )}
          <button type="button" disabled className={`${itemClass} cursor-not-allowed text-zinc-400`}>
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="size-5 shrink-0">
              <circle cx="9" cy="7" r="3.5" />
              <path d="M3 21v-2a4 4 0 0 1 4-4h4m7 0v6m-3-3h6" />
            </svg>
            Invite users
          </button>
        </div>
      </div>
    </div>
  );
}
