import { RotateCcw } from 'lucide-react'
import '../styles/preview.css'

export function PreviewControls({ onRestart }: { onRestart: () => void }) {
  return <aside className="preview-controls" aria-label="Local preview controls">
    <span>Preview</span>
    <button type="button" onClick={onRestart}><RotateCcw size={12} aria-hidden="true"/>Restart invitation</button>
  </aside>
}
