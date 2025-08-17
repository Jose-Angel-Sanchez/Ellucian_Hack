export default function SuperuserLoginPage() {
    
    let state = {
    userProgress: [] as any[],
    recentCourses: [] as any[],
    profile: null as any,
    user: null as any,
    displayName: "Usuario",
    completedCourses: 0,
    inProgressCourses: 0,
    totalTimeSpent: 0,
    averageProgress: 0,
  }


    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Superuser Star page</h1>
            
        </div>
    );
}