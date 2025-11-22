// components/Iconos.tsx
export const CheckIcon = ({ className = "" }: { className?: string }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={`inline mr-2 ${className}`}>
    <path 
      d="M13.3334 4L6.00008 11.3333L2.66675 8" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

export const LinkIcon = ({ className = "" }: { className?: string }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={`inline mr-2 ${className}`}>
    <path 
      d="M6.66675 8.66667L9.33341 6M9.33341 6L6.66675 3.33333M9.33341 6H4.66675M11.3334 9.33333C12.0698 9.33333 12.6667 9.93029 12.6667 10.6667V11.3333C12.6667 12.0697 12.0698 12.6667 11.3334 12.6667H4.66675C3.93037 12.6667 3.33341 12.0697 3.33341 11.3333V10.6667C3.33341 9.93029 3.93037 9.33333 4.66675 9.33333" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

export const LoadingIcon = ({ className = "" }: { className?: string }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={`inline mr-2 animate-spin ${className}`}>
    <circle 
      cx="8" 
      cy="8" 
      r="6" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeOpacity="0.3"
    />
    <path 
      d="M14 8C14 4.68629 11.3137 2 8 2" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round"
    />
  </svg>
);

export const WarningIcon = ({ className = "" }: { className?: string }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={`inline mr-2 ${className}`}>
    <path 
      d="M8 5.33333V8M8 10.6667H8.00667M14 8C14 11.3137 11.3137 14 8 14C4.68629 14 2 11.3137 2 8C2 4.68629 4.68629 2 8 2C11.3137 2 14 4.68629 14 8Z" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

export const IconTarget = ({ className = "" }: { className?: string }) => (
  <svg
    className={`w-5 h-5 ${className}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

export const IconBell = ({ className = "" }: { className?: string }) => (
  <svg
    className={`w-5 h-5 ${className}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 17h5l-5 5v-5zM10.24 8.56a5.97 5.97 0 01-3.77-4.19M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

export const IconArrowUp = ({ className = "" }: { className?: string }) => (
  <svg
    className={`w-4 h-4 ${className}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 10l7-7m0 0l7 7m-7-7v18"
    />
  </svg>
);

export const IconArrowDown = ({ className = "" }: { className?: string }) => (
  <svg
    className={`w-4 h-4 ${className}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 14l-7 7m0 0l-7-7m7 7V3"
    />
  </svg>
);

export const IconRefresh = ({ className = "" }: { className?: string }) => (
  <svg
    className={`w-4 h-4 ${className}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
    />
  </svg>
);

export const IconPlus = ({ className = "" }: { className?: string }) => (
  <svg className={`w-5 h-5 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

export const IconPrice = ({ className = "" }: { className?: string }) => (
  <svg className={`w-5 h-5 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
  </svg>
);