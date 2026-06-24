export interface Book {
  title: string
  author: string
  progress: number
  note?: string
  order?: number
}

export interface Track {
  title: string
  source: string
  note?: string
  order?: number
}

export interface StatusMessageData {
  message: string
  updatedAt?: string
}

export interface ReadingListData {
  books: Book[]
}

export interface ListeningListData {
  tracks: Track[]
}

export type ProjectStatus = 'in progress' | 'just shipped' | 'on pause' | 'coming soon'

export interface CurrentProjectData {
  title: string
  status: ProjectStatus
  description: string
  techStack?: string[]
  nextSteps?: string
  githubUrl?: string
  liveUrl?: string
}

export interface ChairNoteData {
  message: string
}

export interface SiteData {
  statusMessage: StatusMessageData | null
  chairNote: ChairNoteData | null
  readingList: ReadingListData | null
  listeningList: ListeningListData | null
  currentProject: CurrentProjectData | null
}
