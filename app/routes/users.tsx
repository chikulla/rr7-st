import { flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable, type ColumnDef } from "@tanstack/react-table";
import type { Route } from "./+types/users";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { useForm } from "react-hook-form";
import { useNavigation, useSubmit } from "react-router";
import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";

type User = { id: number, name: string, email: string };

let mem: User[] = [
    { id: 1, name: "Taro Tanaka", email: "taro@example.com" },
    { id: 2, name: "Hanako Kikuchi", email: "hanako@example.com" },
];
export async function loader(): Promise<{ users: User[] }> {
    return { users: mem }
}

export type ActionData = { error: string } | { created: User };
export async function action({ request }: Route.ActionArgs): Promise<ActionData> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const form = await request.formData(); // form data取り出し
    const name = String(form.get("name"));
    const email = String(form.get("email"));
    if (!name || !email) return { error: "name and email are required" };

    const id = Math.max(...mem.map(u => u.id)) + 1;
    const user = { id, name, email };
    mem = [...mem, user];
    return { created: user }
}

const cols: ColumnDef<User>[] = [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "name", header: "Name" },
    { accessorKey: "email", header: "Email" },
]

function DataTable<TData, TValue>({ columns, data }: { columns: ColumnDef<TData, TValue>[], data: TData[] }) {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    return (
        <div>
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map(headerGroup => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <TableHead key={header.id}>
                                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                </TableHead>
                            ))}
                        </TableRow>))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map(row => (
                            <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                                {row.getVisibleCells().map(cell => (
                                    <TableCell key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={columns.length}>
                                No results
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}

export default function Users({ loaderData, actionData }: Route.ComponentProps) {
    const { users } = loaderData;
    const navigation = useNavigation();
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
                    <Button type="submit" disabled={navigation.state === "submitting"}>Add</Button>
                </form>
            </Form>

            {
                actionData?.error ? (
                    <p style={{ color: "red" }}>{actionData.error}</p>
                ) : actionData?.created ? (
                    <p>Created: {actionData.created.name}</p>
                ) : null
            }

            <DataTable columns={cols} data={users} />
        </div >
    );
}