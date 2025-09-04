import type { Route } from "../+types/root";
import { api } from "../api/api";

interface User {
    id: number;
    name: string;
}

export async function loader({ params }: Route.LoaderArgs): Promise<User | null> {
    try {
        const user = await api.get(`/users/${params.userId}`);
        return user;
    } catch (error) {
        console.error(`Failed to fetch user ${params.userId}:`, error);
        return null;
    }
}

export default function User({ params, loaderData }: Route.ComponentProps) {
    const user = (loaderData as unknown) as User | null;
    
    return (
        <>
            <h1 className="text-2xl">User {params.userId}</h1>
            <div>
                {user ? (
                    <div>
                        <p><strong>ID:</strong> {user.id}</p>
                        <p><strong>Name:</strong> {user.name}</p>
                        
                        <div className="mt-4 flex gap-4">
                            <a 
                                href={`/users/${params.userId}/edit`}
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                Edit User
                            </a>
                            <a 
                                href="/users"
                                className="text-blue-500 hover:underline"
                            >
                                ← Back to Users
                            </a>
                        </div>
                    </div>
                ) : (
                    <p>User not found.</p>
                )}
            </div>
        </>
    );
}