import { getCourses } from "@/lib/data/db";
import TaskBoard from "@/components/app/TaskBoard";

export default async function TasksPage() {
  const courses = await getCourses();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Tasks</h1>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">
          Prioritized list of what to do next.
        </p>
      </div>
      <TaskBoard courses={courses} />
    </div>
  );
}
