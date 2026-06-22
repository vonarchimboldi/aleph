import { getCourses } from "@/lib/data/db";
import CourseCard from "@/components/app/CourseCard";

export const revalidate = 3600;

export default async function CoursesPage() {
  const courses = await getCourses();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">My courses</h1>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">
          Continue learning where you left off.
        </p>
      </div>

      <div className="space-y-6">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
}
