import React, { useState, useEffect } from 'react';
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/Input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
// import { mockApi, User } from '@/lib/mock';
import { get, post, put, ApiError } from "@/lib/api";
import { User } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";


const columns: ColumnDef<User>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="font-medium">{row.getValue("id")}</div>,
    filterFn: (row, _columnId, value) => {
      return row.getValue<number>("id").toString().includes(value as string);
    },
  },
  {
    accessorKey: "firstName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          First Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    filterFn: (row, _columnId, value) => {
      return row.getValue<string>("firstName").toLowerCase().includes((value as string).toLowerCase());
    },
  },
  {
    accessorKey: "lastName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Last Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    filterFn: (row, _columnId, value) => {
      return row.getValue<string>("lastName").toLowerCase().includes((value as string).toLowerCase());
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    filterFn: (row, _columnId, value) => {
      return row.getValue<string>("email").toLowerCase().includes((value as string).toLowerCase());
    },
  },
  {
    accessorKey: "isAdmin",
    header: "Role",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("isAdmin") ? "Admin" : "User"}</div>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    header: "Actions",
    cell: ({ row }) => {
      const user = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(user.id.toString())}
            >
              Copy ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              View Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              View Orders
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600 focus:text-red-600">
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
];

const ManageUsers: React.FC = () => {
  const navigate = useNavigate();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New states for user management
  const [formMode, setFormMode] = useState<"create" | "update" | null>(null);
  const [currentUser, setCurrentUser] = useState<Partial<User> & { password?: string }>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await get<Array<User>>("/api/user/allCustomers");
        if (response.error || !response.data) {
          throw response.error || { error: "Unknown Error ManageUsers" };
        }
        setUsers(response.data);
      } catch (error) {
        // Using sonner toast for error notification
        const apiError = error as ApiError;
        const errorMessage = apiError.details && apiError.details.length > 0
          ? `${apiError.error}: ${apiError.details.join(', ')}`
          : apiError.error || "Error fetching users";
        toast.error(errorMessage);
        console.error('Error fetching users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const table = useReactTable({
    data: users,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, _columnId, value) => {
      const searchValue = value.toLowerCase();
      return (
        row.getValue<number>("id").toString().includes(searchValue) ||
        row.getValue<string>("firstName").toLowerCase().includes(searchValue) ||
        row.getValue<string>("lastName").toLowerCase().includes(searchValue) ||
        row.getValue<string>("email").toLowerCase().includes(searchValue)
      );
    },
  });

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Validate required fields
      if (!currentUser.firstName || !currentUser.lastName || !currentUser.email) {
        setError("First name, last name, and email are required fields.");
        return;
      }

      // For new users, password is required
      if (formMode === "create" && !currentUser.password) {
        setError("Password is required for new users.");
        return;
      }

      const payload = {
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        email: currentUser.email,
        address: currentUser.address || "",
        isAdmin: currentUser.isAdmin || false,
        ...(currentUser.password && { password: currentUser.password }),
      };

      if (formMode === "create") {
        const response = await post<User>("/api/user", payload);
        if (response.error || !response.data) {
          throw response.error || { error: "Failed to create user" };
        }
        toast.success("User created successfully");
      } else if (formMode === "update" && currentUser.id) {
        const response = await put<User>(`/api/user/${currentUser.id}`, payload);
        if (response.error || !response.data) {
          throw response.error || { error: "Failed to update user" };
        }
        toast.success("User updated successfully");
      }

      setDialogOpen(false);
      setIsLoading(true);
      const refreshed = await get<Array<User>>("/api/user/allCustomers");
      if (refreshed.error || !refreshed.data) {
        throw refreshed.error || { error: "Failed to refresh user data" };
      }
      setUsers(refreshed.data);
    } catch (error) {
      console.error("Failed to submit user:", error);
      const apiError = error as ApiError;
      const errorMessage = apiError.details && apiError.details.length > 0
        ? `${apiError.error}: ${apiError.details.join(', ')}`
        : apiError.error || "An error occurred while processing your request";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute accessLevel="admin">
      <div className="container mx-auto py-10">
        <button
          className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          onClick={() => navigate(`/admin`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Admin Page
        </button>
        <h1 className="text-2xl font-bold mb-6">Manage Accounts</h1>
        <Button
          onClick={() => {
            setCurrentUser({});
            setFormMode("create");
            setDialogOpen(true);
          }}
          className="mb-4"
        >
          + Add Account
        </Button>
        <div className="w-full">
          <div className="flex items-center py-4">
            <Input
              placeholder="Search by ID, first name, last name, or email..."
              value={globalFilter}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="max-w-sm"
            />
            {table.getFilteredSelectedRowModel().rows.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="ml-4">
                    Bulk Actions <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>
                    Export Selected
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600 focus:text-red-600">
                    Delete Selected ({table.getFilteredSelectedRowModel().rows.length})
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  Columns <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    )
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="text-left">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-end space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{formMode === "create" ? "Add User" : "Update User"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div>
              <Label>First Name</Label>
              <Input
                value={currentUser.firstName || ""}
                onChange={(e) => setCurrentUser((u) => ({ ...u, firstName: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label>Last Name</Label>
              <Input
                value={currentUser.lastName || ""}
                onChange={(e) => setCurrentUser((u) => ({ ...u, lastName: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={currentUser.email || ""}
                onChange={(e) => setCurrentUser((u) => ({ ...u, email: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label>Address</Label>
              <Input
                value={currentUser.address || ""}
                onChange={(e) => setCurrentUser((u) => ({ ...u, address: e.target.value }))}
              />
            </div>
            {formMode === "create" && (
              <div>
                <Label>Password</Label>
                <Input
                  type="password"
                  value={currentUser.password || ""}
                  onChange={(e) => setCurrentUser((u) => ({ ...u, password: e.target.value }))}
                  required
                />
              </div>
            )}
            <div className="flex items-center space-x-2">
              <Switch
                id="isAdmin"
                checked={currentUser.isAdmin || false}
                onCheckedChange={(checked) => setCurrentUser((u) => ({ ...u, isAdmin: checked }))}
              />
              <Label htmlFor="isAdmin">Admin User</Label>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Processing..." : formMode === "create" ? "Create" : "Update"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </ProtectedRoute>
  );
};

export default ManageUsers;