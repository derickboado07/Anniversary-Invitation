import { useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'motion/react'
import '../styles/text-motion.css'

interface RevealTextProps {
  children: string
  as?: 'h2' | 'p'
  className?: string
  id?: string
  delay?: number
}

export function RevealText({ children, as = 'h2', className = '', id, delay = 0 }: RevealTextProps) {
  const ref = useRef<HTMLHeadingElement | HTMLParagraphElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.2 })
  const reduced = useReducedMotion()
  const visible = reduced || inView
  const Tag = as
  const pieces = children.split(/(\s+)/u)
  const wordCount = pieces.filter(piece => piece.trim()).length
  const stagger = Math.min(0.055, 0.34 / Math.max(1, wordCount - 1))
  let wordIndex = 0

  return <Tag ref={ref} id={id} className={`reveal-text ${className}`.trim()}>
    <span className="reveal-text-accessible">{children}</span>
    <span aria-hidden="true">
      {pieces.map((piece, index) => {
        if (!piece.trim()) return piece
        const order = wordIndex++
        return <motion.span
          key={index}
          className="reveal-text-word"
          initial={reduced ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 10 }}
          transition={{ duration: reduced ? 0 : 0.42, delay: visible && !reduced ? Math.max(0, delay) + order * stagger : 0, ease: [0.22, 1, 0.36, 1] }}
        >{piece}</motion.span>
      })}
    </span>
  </Tag>
}
