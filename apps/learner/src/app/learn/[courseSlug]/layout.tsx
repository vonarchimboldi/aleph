import { notFound } from "next/navigation";
import { getCourseBySlug } from "@/lib/data/db";
import CourseSidebar from "@/components/learn/CourseSidebar";
import CoursePlayerHeader from "@/components/learn/CoursePlayerHeader";
import { WorkspaceProvider } from "@/components/learn/WorkspaceProvider";

interface CourseLayoutProps {
  children: React.ReactNode;
  params: Promise<{ courseSlug: string }>;
}

export default async function CourseLayout({ children, params }: CourseLayoutProps) {
  const { courseSlug } = await params;
  const course = await getCourseBySlug(courseSlug);
  if (!course) notFound();

  return (
    <WorkspaceProvider course={course}>
      <div className="flex h-[calc(100dvh-4rem)] flex-col bg-zinc-50 dark:bg-zinc-950">
        <CoursePlayerHeader course={course} />
        <div className="flex flex-1 overflow-hidden">
          <CourseSidebar course={course} />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </WorkspaceProvider>
  );
}
