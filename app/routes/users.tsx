import { flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable, type Column, type ColumnDef, type OnChangeFn, type SortingState } from "@tanstack/react-table";
import type { Route } from "./+types/users";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { useForm } from "react-hook-form";
import { useNavigate, useNavigation, useSubmit } from "react-router";
import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"


type User = { id: number, name: string, email: string };

let mem: User[] = [
    { id: 1, name: "Taro Tanaka", email: "taro@example.com" },
    { id: 2, name: "Hanako Kikuchi", email: "hanako@example.com" },
];
export async function loader({ request }: Route.LoaderArgs): Promise<{ users: User[]; sort?: string }> {
    const url = new URL(request.url)
    console.log(url.search)
    const sort = url.searchParams.get("_sort") ?? undefined;
    const r = await fetch(`http://localhost:6173${url.pathname}${url.search}`)
    if (r.ok) {
        const result = JSON.parse(await r.text());
        return { users: result, sort }
    } else {
        return { users: [] } // TODO: handle error
    }

}

export type ActionData = { error: string } | { created: string };
export async function action({ request }: Route.ActionArgs): Promise<ActionData> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const form = await request.formData(); // form data取り出し
    const name = String(form.get("name"));
    const email = String(form.get("email"));
    if (!name || !email) return { error: "name and email are required" };

    const user = { name, email };
    const r = await fetch("http://localhost:6173/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
    })
    if (r.ok) {
        return { created: user.name }
    } else {
        return { error: "failed to create user" }
    }
}

const sortableHeader = (label: string) => ({ column }: { column: Column<User, unknown> }) => {
    const sorted = column.getIsSorted()
    return (<Button
        variant="ghost"
        onClick={() => column.toggleSorting(sorted === "asc")}
    >{label}{sorted === "asc" ? <ArrowUp /> : sorted === "desc" ? <ArrowDown /> : undefined}</Button >)
}

const cols: ColumnDef<User>[] = [
    { accessorKey: "id", header: sortableHeader("ID"), enableSorting: true },
    { accessorKey: "name", header: sortableHeader("Name"), enableSorting: true },
    { accessorKey: "email", header: sortableHeader("Email"), enableSorting: true },
]

function DataTable<TData, TValue>({ columns, data }: { columns: ColumnDef<TData, TValue>[], data: TData[] }) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const navigate = useNavigate();
    useEffect(() => {
        if (sorting.length === 0) {
            return
        }
        const s = sorting[0];
        navigate(`?_sort=${s.desc ? '-' : ''}${s.id}&_order=${s.desc ? "desc" : "asc"}`, { replace: true })
    }, [sorting])
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        onSortingChange: setSorting,
        state: { sorting }
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
                            <TableCell colSpan={columns.length} className="h-24 text-center">
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
                    <p>Created: {actionData.created}</p>
                ) : null
            }

            <DataTable columns={cols} data={users} />
        </div >
    );
}