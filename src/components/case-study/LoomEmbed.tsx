import { useState } from 'react'
import { Skeleton } from '@/components/ui/Skeleton'

interface LoomEmbedProps {
  url: string
}

function loomEmbedUrl(shareUrl: string): string {
  // Converts https://www.loom.com/share/<id> → https://www.loom.com/embed/<id>
  return shareUrl.replace('/share/', '/embed/')
}

export function LoomEmbed({ url }: LoomEmbedProps) {
  const [loaded, setLoaded] = useState(false)

  return (
    <div className="relative w-full aspect-video rounded-card overflow-hidden border border-surface-border">
      {!loaded && <Skeleton className="absolute inset-0 rounded-none" />}
      <iframe
        src={loomEmbedUrl(url)}
        className="absolute inset-0 w-full h-full"
        allowFullScreen
        title="Project walkthrough"
        onLoad={() => setLoaded(true)}
      />
    </div>
  )
}
