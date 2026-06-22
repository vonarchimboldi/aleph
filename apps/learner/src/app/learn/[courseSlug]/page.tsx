import { redirect, notFound } from "next/navigation";
import { getCourseBySlug } from "@/lib/courses/data";

interface CoursePageProps {
  params: Promise<{ courseSlug: string }>;
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { courseSlug } = await params;
  const course = getCourseBySlug(courseSlug);
  if (!course) notFound();

  const firstChapter = course.chapters[0];
  const firstSection = firstChapter?.sections[0];
  if (!firstChapter || !firstSection) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-zinc-600 dark:text-zinc-400">This course has no content yet.</p>
      </div>
    );
  }

  redirect(`/learn/${courseSlug}/${firstChapter.slug}/${firstSection.slug}`);
}
