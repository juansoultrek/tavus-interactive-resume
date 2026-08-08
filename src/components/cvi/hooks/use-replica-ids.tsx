import { useParticipantIds } from '@daily-co/daily-react'

/** Tavus renamed replica → face in Daily user_id; keep legacy match too. */
export const useReplicaIDs = (): string[] => {
  return useParticipantIds({
    filter: (participant) => {
      const userId = participant.user_id ?? ''
      return (
        userId.includes('tavus-face') ||
        userId.includes('tavus-replica') ||
        userId.includes('tavus-pal')
      )
    },
  })
}
