import { Form } from "react-router";
import type { Route } from "./+types/users";

let mem = [
    { id: 1, name: "Taro Tanaka", email: "taro@example.com" },
    { id: 2, name: "Hanako Kikuchi", email: "hanako@example.com" },
];
export async function loader(): Promise<{ users: typeof mem }> {
    console.log("users.tsx loader");
    return { users: mem }
}

export type ActionData = { error: string } | { created: typeof mem[number] };
export async function action({ request }: Route.ActionArgs): Promise<ActionData> {
    const form = await request.formData(); // form data取り出し
    const name = String(form.get("name"));
    const email = String(form.get("email"));
    if (!name || !email) return { error: "name and email are required" };

    const id = Math.max(...mem.map(u => u.id)) + 1;
    const user = { id, name, email };
    mem = [...mem, user];
    return { created: user }
}
export default function Users({ loaderData, actionData }: Route.ComponentProps) {
    const { users } = loaderData;
    return (
        <div>
            <h1>Users</h1>
            <Form method="post">
                <input name="name" placeholder="name" type="text" />
                <input name="email" placeholder="email" type="email" />
                <button type="submit">Add</button>
            </Form>

            {actionData?.error ? (
                <p style={{ color: "red" }}>{actionData.error}</p>
            ) : actionData?.created ? (
                <p>Created: {actionData.created.name}</p>
            ) : null}

            <ul>
                {users.map(u => (<li key={u.id}>#{u.id} {u.name} ({u.email})</li>))}
            </ul>
        </div >
    );
}