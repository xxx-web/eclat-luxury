interface DividerProps {
  className?: string;
}

export function SectionDivider({ className = '' }: DividerProps) {
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${className}`}
      style={{ height: '80px' }}
    >
      <div
        className="absolute"
        style={{
          width: '200px',
          height: '1px',
          background:
            'linear-gradient(90deg, transparent, rgba(155,127,255,0.12), rgba(212,168,75,0.12), rgba(155,127,255,0.12), transparent)',
        }}
      />
      <div
        style={{
          width: '8px',
          height: '8px',
          background: '#D4A84B',
          transform: 'rotate(45deg)',
          opacity: 0.6,
          zIndex: 1,
          boxShadow: '0 0 12px rgba(212,168,75,0.3)',
        }}
      />
    </div>
  );
}
