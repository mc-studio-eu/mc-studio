type PreviewKind = 'pdf' | 'image' | 'video' | 'audio'

interface FilePreview {
  kind: PreviewKind
  mime: string
}

// Uploaded filenames are available for both older database files and R2 objects.
const formats: Record<string, FilePreview> = {
  pdf: { kind: 'pdf', mime: 'application/pdf' },
  jpg: { kind: 'image', mime: 'image/jpeg' },
  jpeg: { kind: 'image', mime: 'image/jpeg' },
  png: { kind: 'image', mime: 'image/png' },
  gif: { kind: 'image', mime: 'image/gif' },
  webp: { kind: 'image', mime: 'image/webp' },
  avif: { kind: 'image', mime: 'image/avif' },
  mp4: { kind: 'video', mime: 'video/mp4' },
  webm: { kind: 'video', mime: 'video/webm' },
  mp3: { kind: 'audio', mime: 'audio/mpeg' },
  wav: { kind: 'audio', mime: 'audio/wav' },
  m4a: { kind: 'audio', mime: 'audio/mp4' },
  ogg: { kind: 'audio', mime: 'audio/ogg' },
  oga: { kind: 'audio', mime: 'audio/ogg' },
}

export function portalFilePreview(fileName: string): FilePreview | undefined {
  const extension = /\.([a-z0-9]+)$/i.exec(fileName)?.[1]?.toLowerCase()
  if (extension && Object.hasOwn(formats, extension)) return formats[extension]
}
