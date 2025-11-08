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