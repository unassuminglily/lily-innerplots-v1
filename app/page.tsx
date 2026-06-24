import {getStatusMessage, getChairNote, getReadingList, getListeningList, getCurrentProject} from '@/lib/queries'
import MeadowCanvas from '@/components/MeadowCanvas'
import type {SiteData} from '@/lib/types'

export default async function Home() {
  const [statusMessage, chairNote, readingList, listeningList, currentProject] = await Promise.all([
    getStatusMessage(),
    getChairNote(),
    getReadingList(),
    getListeningList(),
    getCurrentProject(),
  ])

  const data: SiteData = {statusMessage, chairNote, readingList, listeningList, currentProject}

  return <MeadowCanvas data={data}/>
}
