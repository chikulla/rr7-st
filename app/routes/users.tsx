import {
    flexRender, getCoreRowModel, getFilteredRowModel,
    getPaginationRowModel, getSortedRowModel,
    useReactTable, type Column, type ColumnDef,
    type OnChangeFn, type SortingState, type PaginationState,
} from "@tanstack/react-table";
import type { Route } from "./+types/users";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { useForm } from "react-hook-form";
import { redirect, useLocation, useNavigate, useNavigation, useSubmit } from "react-router";
import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "~/components/ui/pagination";


type User = { id: number, name: string, email: string };

let mem: User[] = [
    { id: 1, name: "Taro Tanaka", email: "taro@example.com" },
    { id: 2, name: "Hanako Kikuchi", email: "hanako@example.com" },
];
export async function loader({ request }: Route.LoaderArgs): Promise<{ users: User[]; sort?: string, pages: number } | Response> {
    const url = new URL(request.url)
    if (!url.searchParams.get("_page") || !url.searchParams.get("_per_page")) {
        return redirect(`${url.pathname}?_page=1&_per_page=10${url.search ? '&' + url.searchParams.toString() : ''}`);
    }
    const sort = url.searchParams.get("_sort") ?? undefined;
    const r = await fetch(`http://localhost:6173${url.pathname}${url.search}`)
    if (r.ok) {
        const result = JSON.parse(await r.text());
        return { users: result.data, pages: result.pages, sort }
    } else {
        return { users: [], pages: 0 } // TODO: handle error
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

function DataTable<TData, TValue>({ columns, data, pages }: { columns: ColumnDef<TData, TValue>[], data: TData[], pages: number }) {
    const location = useLocation();
    const params = new URLSearchParams(location.search)
    const _page = params.get("_page") || "1"
    const _perPage = params.get("_per_page") || "10"

    const [sorting, setSorting] = useState<SortingState>([]);
    const [pagination, setPagination] = useState<PaginationState>({ pageIndex: _page ? parseInt(_page) - 1 : 0, pageSize: _perPage ? parseInt(_perPage) : 10 });
    const navigate = useNavigate();
    useEffect(() => {
        if (sorting.length === 0) {
            return
        }
        const params = new URLSearchParams(location.search)
        const s = sorting[0];
        params.set("_sort", `${s.desc ? '-' : ''}${s.id}`);
        params.set("_page", "1");
        navigate({ pathname: location.pathname, search: params.toString() }, { replace: true })
        // TODO: Tanstack's internal page doesnt reset to 1 when sorting changes (previous is enabled when I visit page > 1)
    }, [sorting])
    useEffect(() => {
        console.log("pagination changed: ", pagination)
        navigate(`?_page=${pagination.pageIndex + 1}&_per_page=${pagination.pageSize}`, { replace: true })
        // console.log("pagination changed: ", pagination)
    }, [pagination])
    const table = useReactTable({
        data,
        columns,
        pageCount: pages,
        getCoreRowModel: getCoreRowModel(),
        onSortingChange: setSorting,
        onPaginationChange: setPagination,
        manualPagination: true,
        state: { sorting, pagination }
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
            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious className={table.getCanPreviousPage() ? '' : 'pointer-events-none opacity-50'} onClick={() => table.previousPage()} />
                    </PaginationItem>
                    <PaginationItem>
                    </PaginationItem>
                    <PaginationItem>
                        <PaginationNext className={table.getCanNextPage() ? '' : 'pointer-events-none opacity-50'} onClick={() => table.nextPage()} />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    )
}

export default function Users({ loaderData, actionData }: Route.ComponentProps) {
    const { users, pages } = loaderData;
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
        <div className="p-6">
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

            <DataTable columns={cols} data={users} pages={pages} />
        </div >
    );
}