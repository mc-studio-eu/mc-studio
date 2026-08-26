import { projects as projectData } from '../data/projects'
import type { ProjectCategory } from '../data/projects'

export type ProjectFilter = 'all' | ProjectCategory

export interface ProjectCard {
  id: number
  slug: string
  title: string
  description: string
  image: string
  categories: ProjectCategory[]
  tags: string[]
  testimonial?: {
    review: string
    name: string
    job: string
    avatar: string
  }
}

export const projectFilters: Array<{ value: ProjectFilter; labelKey: string }> = [
  { value: 'all', labelKey: 'projects.filters.all' },
  { value: 'landing-page', labelKey: 'projects.filters.landing_page' },
  { value: 'app', labelKey: 'projects.filters.app' },
]

/**
 * Localized project cards shared by the landing section and portfolio page.
 * The newest case studies come first, then projects keep their data-file order.
 */
export function useProjectCards() {
  const { t, tm, rt } = useI18n()

  const projects = computed<ProjectCard[]>(() =>
    projectData.map((project, index) => ({
      id: index + 1,
      slug: project.slug,
      title: project.title,
      description: t(`projects.items.${project.i18nKey}.description`),
      image: project.image,
      categories: project.categories,
      tags: Object.values(tm(`projects.items.${project.i18nKey}.tags`) as Record<string, string> || {}).map(tag => rt(tag)),
      testimonial: project.testimonial
        ? {
            review: t(`projects.items.${project.i18nKey}.testimonial.review`),
            name: project.testimonial.name,
            job: t(`projects.items.${project.i18nKey}.testimonial.job`),
            avatar: project.testimonial.avatar,
          }
        : undefined,
    }))
  )

  const filterProjects = (activeFilter: ProjectFilter) => {
    const matchingProjects = activeFilter === 'all'
      ? projects.value
      : projects.value.filter(project => project.categories.includes(activeFilter))

    return [...matchingProjects].sort((firstProject, secondProject) => {
      const latestCaseStudyPriority =
        Number(secondProject.slug === 'maison-awl') - Number(firstProject.slug === 'maison-awl')

      if (latestCaseStudyPriority !== 0) return latestCaseStudyPriority

      return firstProject.id - secondProject.id
    })
  }

  return { projects, filterProjects }
}
