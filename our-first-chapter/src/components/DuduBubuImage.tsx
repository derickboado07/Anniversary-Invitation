import '../styles/dudu-bubu.css'

const artwork = {
  together: { src: '/images/dudu-bubu/together.png', width: 1070, height: 1038 },
  hearts: { src: '/images/dudu-bubu/bucket-hat-hearts.webp', width: 500, height: 500 },
}

export function DuduBubuImage({ scene }: { scene: keyof typeof artwork }) {
  return <img {...artwork[scene]} className={`dudu-bubu-image dudu-bubu-image--${scene}`} alt="" aria-hidden="true" loading="lazy" decoding="async" draggable={false}/>
}
