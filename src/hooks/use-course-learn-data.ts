import { useQuery } from '@tanstack/react-query'
import { userCourseService } from '@/services/user/course.service'
import { userNoteService } from '@/services/user/note.service'

export function useCourseLearnData(urlCourseId: string) {
  const {
    data: course,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['user', 'course', 'learn', urlCourseId],
    queryFn: () => userCourseService.getLearnExperience(urlCourseId),
  })

  const courseUuid = course?.uuid || urlCourseId

  const { data: announcements = [] } = useQuery({
    queryKey: ['user', 'course', courseUuid, 'announcements'],
    queryFn: () => userCourseService.getAnnouncements(courseUuid),
    enabled: !!course,
  })

  const { data: comments = [] } = useQuery({
    queryKey: ['user', 'course', courseUuid, 'comments'],
    queryFn: () => userCourseService.getComments(courseUuid),
    enabled: !!course,
  })

  const { data: certificate } = useQuery({
    queryKey: ['user', 'course', courseUuid, 'certificate'],
    queryFn: () => userCourseService.getCertificate(courseUuid),
    enabled:
      !!course && (course.modules?.every((m) => m.is_completed) || false),
  })

  return {
    course,
    courseUuid,
    announcements,
    comments,
    certificate,
    isLoading,
    isError,
    refetch,
  }
}
