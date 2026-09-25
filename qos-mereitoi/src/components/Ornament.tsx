export function Ornament({ className = "" }: { className?: string }) {
  return <svg aria-hidden="true" viewBox="0 0 160 40" fill="none" className={`ornament ${className}`}>
    <g stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 20h25c11 0 13-15 3-15-9 0-9 12-1 12M152 20h-25c-11 0-13-15-3-15 9 0 9 12 1 12" />
      <path d="M33 20c15 0 15 16 26 12 8-3 5-13-2-10-5 2-2 7 2 5M127 20c-15 0-15 16-26 12-8-3-5-13 2-10 5 2 2 7-2 5" />
      <path d="M44 20h19l17-15 17 15H116M63 20l17 15 17-15M73 20l7-7 7 7-7 7z" />
      <path d="M3 20h1m152 0h1" />
    </g>
  </svg>;
}

export function Botanical({ className = "" }: { className?: string }) {
  return <svg aria-hidden="true" viewBox="0 0 90 260" fill="none" className={`botanical ${className}`}>
    <g stroke="currentColor" strokeWidth="1.1" strokeLinecap="round">
      <path d="M38 250C65 167 24 91 57 12" />
      <path d="M48 217c-23-1-37-14-36-35 21 1 31 15 36 35ZM52 193c23-6 28-23 23-41-18 8-22 23-23 41ZM50 164c-25-2-34-16-31-36 19 3 29 15 31 36ZM45 137c22-7 30-21 25-41-18 9-24 21-25 41ZM44 106c-19-5-25-17-21-32 16 3 22 15 21 32ZM45 80c22-7 28-20 21-37-17 9-21 22-21 37ZM50 49c-15-9-17-23-9-35 13 8 15 21 9 35Z" />
    </g>
  </svg>;
}
