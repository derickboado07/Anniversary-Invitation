import '../styles/dudu-bubu.css'

type Pose = 'cuddle' | 'letter' | 'celebrate'

const ink = '#654438'
const caramel = '#bd8b65'
const cream = '#fffaf0'
const wine = '#9c455b'

function Heart({ x, y, size = 20, className = '' }: { x: number; y: number; size?: number; className?: string }) {
  return <g transform={`translate(${x} ${y})`}><path className={className} d="M16 29C12 25 1 18 1 10A8 8 0 0 1 16 6 8 8 0 0 1 31 10C31 18 20 25 16 29Z" transform={`scale(${size / 32})`} fill={wine}/></g>
}

function BearHead({ bubu = false, happy = false }: { bubu?: boolean; happy?: boolean }) {
  return <g stroke={ink} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="23" cy="27" r="15" fill={bubu ? ink : caramel}/>
    <circle cx="97" cy="27" r="15" fill={bubu ? ink : caramel}/>
    {!bubu && <><circle cx="23" cy="27" r="7" fill="#dfb495" stroke="none"/><circle cx="97" cy="27" r="7" fill="#dfb495" stroke="none"/></>}
    <path d="M8 65C8 34 27 17 60 17S112 34 112 65C115 94 96 111 60 111S5 94 8 65Z" fill={bubu ? cream : caramel}/>
    <ellipse cx="27" cy="83" rx="10" ry="6" fill="#eda39d" opacity={bubu ? '.78' : '.72'} stroke="none"/>
    <ellipse cx="92" cy="83" rx="10" ry="6" fill="#eda39d" opacity={bubu ? '.78' : '.72'} stroke="none"/>
    {!bubu && <ellipse cx="60" cy="84" rx="16" ry="13" fill="#f0d4b5" stroke="none"/>}
    {happy ? <><path d="m38 71 5-4 5 4M73 71l5-4 5 4" fill="none"/></> : <><ellipse cx="43" cy="72" rx="2.8" ry="3.8" fill={ink} stroke="none"/><ellipse cx="78" cy="72" rx="2.8" ry="3.8" fill={ink} stroke="none"/></>}
    <ellipse cx="60" cy="80" rx="3.5" ry="2.5" fill={ink} stroke="none"/>
    <path d="M60 83v4m-7-1c1 5 6 5 7 1 1 4 6 4 7-1" fill="none" strokeWidth="2.5"/>
    {bubu && <path d="m43 58-3-2m38 2 3-2" fill="none" strokeWidth="2" opacity=".65"/>}
  </g>
}

function SeatedBodies() {
  return <g stroke={ink} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M78 145c-14 14-17 36-11 54 4 13 20 16 42 16 25 0 40-6 40-24 0-23-8-39-23-48Z" fill={caramel}/>
    <ellipse cx="109" cy="187" rx="22" ry="23" fill="#f0d4b5" stroke="none"/>
    <path d="M187 143c-15 13-22 29-22 51 0 15 16 22 41 22 25 0 39-5 42-19 4-18-1-38-16-53Z" fill={cream}/>
    <ellipse cx="79" cy="208" rx="18" ry="10" fill={caramel} transform="rotate(-9 79 208)"/>
    <ellipse cx="133" cy="210" rx="15" ry="9" fill={caramel}/>
    <ellipse cx="183" cy="211" rx="15" ry="9" fill={ink}/>
    <ellipse cx="235" cy="209" rx="17" ry="10" fill={ink} transform="rotate(9 235 209)"/>
  </g>
}

function Cuddle() {
  return <>
    <Heart x={139} y={22} size={22} className="dudu-bubu-heart"/>
    <Heart x={267} y={87} size={13} className="dudu-bubu-heart dudu-bubu-heart-late"/>
    <Heart x={33} y={110} size={11} className="dudu-bubu-heart dudu-bubu-heart-late"/>
    <SeatedBodies/>
    <g transform="translate(48 35) rotate(8 60 66)"><BearHead/></g>
    <g transform="translate(151 32) rotate(-8 60 66)"><BearHead bubu/></g>
    <g stroke={ink} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M160 207c-7-7-35-22-35-39a18 18 0 0 1 35-6 18 18 0 0 1 35 6c0 17-28 32-35 39Z" fill={wine}/>
      <path d="M100 159c8-5 16 0 25 9 8 8 13 12 9 18-5 7-14 2-22-3" fill={caramel}/>
      <path d="M220 158c-9-4-18 1-27 11-7 7-11 12-7 17 5 7 14 1 21-4" fill={cream}/>
      <path d="m142 164 4-3" stroke="#d68b99" strokeWidth="4"/>
    </g>
  </>
}

function Letter() {
  return <>
    <Heart x={145} y={19} size={20} className="dudu-bubu-heart"/>
    <Heart x={268} y={100} size={12} className="dudu-bubu-heart dudu-bubu-heart-late"/>
    <g stroke={ink} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M75 147c-12 14-16 42-10 59 3 10 23 11 46 10 21 0 38-5 38-19l-15-50Z" fill={caramel}/>
      <path d="m186 146-17 53c1 12 19 17 43 17 21 0 38-3 40-14 3-20-4-40-18-57Z" fill={cream}/>
      <ellipse cx="80" cy="211" rx="17" ry="9" fill={caramel}/>
      <ellipse cx="239" cy="211" rx="16" ry="9" fill={ink}/>
    </g>
    <g transform="translate(48 34) rotate(7 60 66)"><BearHead/></g>
    <g transform="translate(152 32) rotate(-7 60 66)"><BearHead bubu/></g>
    <g stroke={ink} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="106" y="159" width="108" height="62" rx="6" fill="#f3d1cd" transform="rotate(-3 160 190)"/>
      <path d="m111 213 36-27m61 21-35-23" stroke="#c89191" strokeWidth="2"/>
      <path d="m108 164 48 29a9 9 0 0 0 9 0l46-34" fill="#f9e0d8" stroke="#c89191" strokeWidth="2"/>
      <path d="M104 160c-8-2-14 4-15 11-2 7 4 12 11 11l14-2c8-1 9-15 1-17Z" fill={caramel}/>
      <path d="M215 157c7-2 14 5 15 12 1 7-4 12-11 11l-14-2c-8-2-8-15 0-17Z" fill={cream}/>
    </g>
    <Heart x={149} y={184} size={24}/>
  </>
}

function Celebrate() {
  return <>
    <Heart x={145} y={18} size={23} className="dudu-bubu-heart"/>
    <Heart x={28} y={62} size={16} className="dudu-bubu-heart dudu-bubu-heart-late"/>
    <Heart x={274} y={65} size={17} className="dudu-bubu-heart dudu-bubu-heart-late"/>
    <g fill="none" stroke="#c59872" strokeWidth="3" strokeLinecap="round">
      <path d="m55 31-4-6m53 3 2-8m109 8-2-8m53 14 4-6m-1 115 6 3M42 145l-6 3"/>
    </g>
    <SeatedBodies/>
    <g stroke={ink} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
      <path className="dudu-bubu-wave" d="M79 164c-13-3-27-14-33-26-4-9-12-7-13 0-2 12 7 34 29 45" fill={caramel}/>
      <path d="M239 164c14-5 25-15 31-28 4-8 12-5 12 2 1 13-7 33-27 45" fill={cream}/>
      <path d="M130 164c9 4 15 7 29 7 14 0 22-4 29-8l6 15c-11 6-23 10-35 9-15 0-26-4-34-9Z" fill={caramel}/>
      <path d="M190 163c-8 4-13 7-24 8-7 0-9 11-2 15 8 4 21-2 31-9" fill={cream}/>
    </g>
    <g transform="translate(46 30) rotate(-5 60 66)"><BearHead happy/></g>
    <g transform="translate(153 28) rotate(5 60 66)"><BearHead bubu happy/></g>
    <Heart x={147} y={191} size={25}/>
  </>
}

/** Original, decorative vector stickers of the little bear couple. */
export function DuduBubu({ pose = 'cuddle', className = '' }: { pose?: Pose; className?: string }) {
  return <svg className={`dudu-bubu dudu-bubu--${pose} ${className}`.trim()} viewBox="0 0 320 240" width="320" height="240" fill="none" aria-hidden="true" focusable="false">
    <ellipse cx="160" cy="221" rx="103" ry="8" fill="#b17c65" opacity=".13"/>
    {pose === 'letter' ? <Letter/> : pose === 'celebrate' ? <Celebrate/> : <Cuddle/>}
  </svg>
}
