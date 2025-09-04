import type { Route } from "../+types/root";
import { api } from "../api/api";
import { Form, redirect } from "react-router";

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

export async function action({ params, request }: Route.ActionArgs) {
    const formData = await request.formData();
    const name = formData.get("name") as string;
    
    try {
        await api.put(`/users/${params.userId}`, { name });

        return redirect(`/users/${params.userId}`);
    } catch (error) {
        console.error(`Failed to update user ${params.userId}:`, error);
        return { error: "Failed to update user" };
    }
}

export default function EditUser({ params, loaderData, actionData }: Route.ComponentProps) {
    const user = (loaderData as unknown) as User | null;
    const error = ((actionData as unknown) as { error?: string })?.error;
    
    if (!user) {
        return (
            <div>
                <h1 className="text-2xl">Edit User</h1>
                <p>User not found.</p>
                <a href={`/users`} className="text-blue-500 hover:underline">
                    ← Back to Users
                </a>
            </div>
        );
    }
    
    return (
        <div>
            <h1 className="text-2xl">Edit User {params.userId}</h1>
            
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}
            
            <Form method="post" className="max-w-md">
                <div className="mb-4">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Name:
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        defaultValue={user.name}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                
                <div className="flex gap-4">
                    <button 
                        type="submit"
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Save Changes
                    </button>
                    <a 
                        href={`/users/${params.userId}`}
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                        Cancel
                    </a>
                </div>
            </Form>
            
            <div className="mt-6">
                <a href={`/users/${params.userId}`} className="text-blue-500 hover:underline">
                    ← Back to User
                </a>
            </div>
        </div>
    );
}
