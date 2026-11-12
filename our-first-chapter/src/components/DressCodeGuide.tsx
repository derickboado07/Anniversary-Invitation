import { motion, useReducedMotion } from 'motion/react'
import type { AttireOption } from '../data/anniversary'
import '../styles/dress-code.css'

const line = '#78525a'
const wine = '#8c4158'

function DressIllustration() {
  return <g stroke={line} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M74 53 84 35c8 7 24 7 32 0l10 18-10 44c3 27 17 47 24 76-22 10-57 10-80 0 7-29 21-49 24-76Z" fill={wine}/>
    <path d="m84 35 4 22c6 8 18 8 24 0l4-22" fill="#f4dbe0"/>
    <path d="M84 96c9 3 23 3 32 0" fill="none" stroke="#e3bdc5"/>
    <path d="M98 100c-2 25-7 48-10 73m18-73c2 23 6 47 9 74M72 164c18 4 37 7 56 4" fill="none" stroke="#bd7e91" strokeWidth="1"/>
    <path d="M83 94c10 2 23 2 34 0" fill="none" stroke="#e7c99a" strokeWidth="2"/>
    <path d="m123 188 10 4 1 9c-7 3-18 2-23-1 3-5 9-6 12-12Z" fill="#c39875"/>
    <path d="m133 200 1 7m-15-14 8 3" fill="none"/>
    <path d="m71 190 10 3 2 9c-7 3-18 3-23-1 3-4 8-6 11-11Z" fill="#c39875"/>
    <path d="m81 202 1 6m-15-13 8 2" fill="none"/>
    <path d="M148 116c7-7 14-1 12 5-2 5-12 11-12 11s-9-8-8-13c0-5 5-6 8-3Z" fill="none" stroke="#c99c9e" strokeWidth="1"/>
  </g>
}

function FormalIllustration() {
  return <g stroke={line} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m75 124-5 74 24 1 7-56 7 56 24-1-6-74Z" fill="#51434d"/>
    <path d="M84 144v45m35-45 3 45" fill="none" stroke="#8c7785" strokeWidth="1"/>
    <path d="m70 198-6 8c8 5 23 5 30 1l-1-9m16 0-1 9c7 4 21 4 29-1l-6-8" fill="#4a343c"/>
    <path d="m78 44-17 10-15 58 15 6 16-39-5 59c14 6 42 6 57 0l-5-59 15 39 15-6-15-58-17-10Z" fill="#594650"/>
    <path d="m83 43 17 67 18-67c-9 5-26 5-35 0Z" fill="#fff9f4"/>
    <path d="m84 43-8 19 14 10-6 9 16 29m18-67 8 19-14 10 6 9-18 29" fill="#78616d"/>
    <path d="m96 57 4 4 4-4-4-6Zm1 5-4 28 7 10 7-10-4-28Z" fill="#c59c72" stroke="#a98060" strokeWidth="1"/>
    <path d="M100 111v27m-21-32 10 1m21 0 11-1m-41 6 9 1m21 0 10-1" fill="none" stroke="#9d8591"/>
    <circle cx="104" cy="119" r="1.4" fill="#e7c99a" stroke="none"/>
    <circle cx="104" cy="129" r="1.4" fill="#e7c99a" stroke="none"/>
    <path d="m121 65 8-1-2 6h-5" fill="#f0d7de" strokeWidth="1"/>
  </g>
}

function SemiFormalIllustration() {
  return <g stroke={line} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m77 126-5 72 22 1 8-58 8 58 22-1-6-72Z" fill="#ac8f7e"/>
    <path d="m78 128 49 0m-42 13-2 48m37-48 4 48" fill="none" stroke="#d9c3b3" strokeWidth="1"/>
    <path d="m83 43 18 62 18-62c-12 5-24 5-36 0Z" fill="#d6a1ab"/>
    <path d="m82 43-18 11-15 62 14 3 15-43-3 61 24 1 2-33 2 33 25-1-4-61 15 43 14-3-15-62-18-11-19 62Z" fill="#f1e3d2"/>
    <path d="m82 43-8 20 13 8-5 9 19 25m19-62 9 20-14 8 6 9-20 25" fill="#fff9ef"/>
    <path d="M78 111h12m21 0h13m-44 5h10m21 0h11" fill="none" stroke="#bba18d" strokeWidth="1"/>
    <circle cx="106" cy="117" r="1.6" fill="#b98f65" stroke="none"/>
    <path d="m73 198-7 7c7 6 22 6 29 1l-1-8m17 0-1 8c7 5 22 5 29-1l-7-7" fill="#9c6a62"/>
    <path d="m77 202 12 1m26 0 12-1" fill="none" stroke="#e7c99a"/>
    <path d="m146 139 11-2 9 25c-7 3-17 4-24 1Z" fill="#c89395"/>
    <path d="M147 140c-5-18 14-18 10-2" fill="none" stroke="#a97c7f"/>
  </g>
}

function OutfitIllustration({ kind }: { kind: AttireOption['id'] }) {
  return <svg className="attire-illustration" viewBox="0 0 200 230" width="200" height="230" fill="none" aria-hidden="true" focusable="false">
    <path d="M35 183V95a65 65 0 0 1 130 0v88" stroke="#dcc3b5" strokeWidth="1"/>
    <ellipse cx="100" cy="211" rx="55" ry="5" fill="#b58d7b" opacity=".13"/>
    <path d="M96 22c0-8 11-8 11-1 0 5-7 5-7 11m-1 0L72 45c-3 2-2 5 1 5h54c3 0 4-3 1-5L101 32" stroke="#bf9a72" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    {kind === 'dress' ? <DressIllustration/> : kind === 'formal' ? <FormalIllustration/> : <SemiFormalIllustration/>}
    <path d="m44 57 2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5Zm115-15 1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3Z" fill="#c5a378" opacity=".7"/>
  </svg>
}

export function DressCodeGuide({ options }: { options: AttireOption[] }) {
  const reduced = useReducedMotion()
  return <div className="dress-code-guide">
    {options.map((option, index) => <motion.article
      key={option.id}
      className={`attire-card attire-card--${option.id}`}
      initial={reduced ? false : { opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: .2 }}
      transition={{ duration: reduced ? 0 : .5, delay: reduced ? 0 : index * .08 }}
      whileHover={reduced ? undefined : { y: -4 }}
    >
      <div className="attire-card-art"><OutfitIllustration kind={option.id}/></div>
      <div className="attire-card-copy">
        <h4 className="attire-card-label">{option.label}</h4>
        <p className="attire-card-example">{option.example}</p>
        <p className="attire-card-detail">{option.detail}</p>
      </div>
    </motion.article>)}
  </div>
}
