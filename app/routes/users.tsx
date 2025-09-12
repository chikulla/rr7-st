import type { Route } from "./+types/users";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { useForm } from "react-hook-form";
import { useSubmit } from "react-router";
import { useEffect } from "react";

let mem = [
    { id: 1, name: "Taro Tanaka", email: "taro@example.com" },
    { id: 2, name: "Hanako Kikuchi", email: "hanako@example.com" },
];
export async function loader(): Promise<{ users: typeof mem }> {
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
    const form = useForm<{ name: string, email: string }>({ defaultValues: { name: "", email: "" } });
    const submit = useSubmit();
    function onSubmit(data: { name: string, email: string }) {
        console.log("onSubmit: ", data);
        const fd = new FormData();
        fd.set("name", data.name);
        fd.set("email", data.email);
        submit(fd, { method: "post" });
    }
    useEffect(() => {
        if (actionData?.created) {
            form.reset()
        }
    }, [actionData, form])
    return (
        <div>
            <h1>Users</h1>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mb-8">
                    <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input placeholder="name" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input placeholder="email" type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <Button type="submit" disabled={form.formState.isSubmitted}>Add</Button>
                </form>
            </Form>

            {
                actionData?.error ? (
                    <p style={{ color: "red" }}>{actionData.error}</p>
                ) : actionData?.created ? (
                    <p>Created: {actionData.created.name}</p>
                ) : null
            }

            <ul>
                {users.map(u => (<li key={u.id}>#{u.id} {u.name} ({u.email})</li>))}
            </ul>
        </div >
    );
}