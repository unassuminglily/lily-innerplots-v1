import {client} from './sanity'
import type {StatusMessageData, ChairNoteData, ReadingListData, ListeningListData, CurrentProjectData} from './types'

const REVALIDATE = {next: {revalidate: 3600}} as const

export function getStatusMessage() {
  return client.fetch<StatusMessageData | null>(
    `*[_type == "statusMessage" && _id == "statusMessage"][0]{ message, updatedAt }`,
    {},
    REVALIDATE,
  )
}

export function getChairNote() {
  return client.fetch<ChairNoteData | null>(
    `*[_type == "chairNote" && _id == "chairNote"][0]{ message }`,
    {},
    REVALIDATE,
  )
}

export function getReadingList() {
  return client.fetch<ReadingListData | null>(
    `*[_type == "readingList" && _id == "readingList"][0]{
      "books": books[] | order(order asc) { title, author, progress, note, order }
    }`,
    {},
    REVALIDATE,
  )
}

export function getListeningList() {
  return client.fetch<ListeningListData | null>(
    `*[_type == "listeningList" && _id == "listeningList"][0]{
      "tracks": tracks[] | order(order asc) { title, source, note, order }
    }`,
    {},
    REVALIDATE,
  )
}

export function getCurrentProject() {
  return client.fetch<CurrentProjectData | null>(
    `*[_type == "currentProject" && _id == "currentProject"][0]{
      title, status, description, techStack, nextSteps, githubUrl, liveUrl
    }`,
    {},
    REVALIDATE,
  )
}
