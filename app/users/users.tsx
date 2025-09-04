import type { Route } from "../+types/root";
import { api } from "../api/api";

interface User {
    id: number;
    name: string;
}

export async function loader(): Promise<User[]> {
    try {
        throw "err"
        const users = await api.get('/users');
        return users;
    } catch (error) {
        console.error('Failed to fetch users:', error);
        return [];
    }
}

export default function Users({ loaderData }: Route.ComponentProps) {
    const users = (loaderData as unknown) as User[];
    
    return (
        <>
            <h1 className="text-2xl">Users</h1>
            <div>
                {users && users.length > 0 ? (
                    <ul>
                        {users.map((user) => (
                            <li key={user.id}>
                                <a href={`/users/${user.id}`}>
                                    {user.name} (ID: {user.id})
                                </a>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No users found.</p>
                )}
            </div>
        </>
    )
}