import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import * as React from 'react';
import { useQuery } from '@starter/platform-query';
import { createApiClient, ResourcesApi } from '@starter/data-access';
import { Card, CardHeader, CardTitle, CardContent } from '@starter/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@starter/ui/table';
import { Button } from '@starter/ui/button';
import { formatRelativeTime } from '@starter/utils';
const apiClient = createApiClient();
const resourcesApi = new ResourcesApi(apiClient);
export function ResourcesPage() {
    const [page, setPage] = React.useState(1);
    const [search, setSearch] = React.useState('');
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['resources', { page, search }],
        queryFn: () => resourcesApi.list({ page, perPage: 20, search }),
    });
    if (error) {
        return (_jsx("div", { className: "p-8", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Error Loading Resources" }) }), _jsxs(CardContent, { children: [_jsx("p", { className: "text-red-600", children: String(error) }), _jsx(Button, { onClick: () => refetch(), className: "mt-4", children: "Retry" })] })] }) }));
    }
    return (_jsxs("div", { className: "p-8", children: [_jsxs("div", { className: "mb-6", children: [_jsx("h1", { className: "text-3xl font-bold mb-2", children: "Resources" }), _jsx("p", { className: "text-gray-600", children: "Manage your resources" })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx(CardTitle, { children: "All Resources" }), _jsx("div", { className: "flex gap-2", children: _jsx("input", { type: "text", placeholder: "Search...", value: search, onChange: (e) => setSearch(e.target.value), className: "px-3 py-2 border border-gray-300 rounded-md" }) })] }) }), _jsx(CardContent, { children: isLoading ? (_jsx("div", { className: "text-center py-8", children: _jsx("p", { className: "text-gray-500", children: "Loading..." }) })) : data?.items.length === 0 ? (_jsx("div", { className: "text-center py-8", children: _jsx("p", { className: "text-gray-500", children: "No resources found" }) })) : (_jsxs(_Fragment, { children: [_jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Name" }), _jsx(TableHead, { children: "Description" }), _jsx(TableHead, { children: "Status" }), _jsx(TableHead, { children: "Created" })] }) }), _jsx(TableBody, { children: data?.items.map((resource) => (_jsxs(TableRow, { children: [_jsx(TableCell, { className: "font-medium", children: resource.name }), _jsx(TableCell, { children: resource.description || '-' }), _jsx(TableCell, { children: _jsx("span", { className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${resource.status === 'active'
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-gray-100 text-gray-800'}`, children: resource.status }) }), _jsx(TableCell, { children: formatRelativeTime(resource.createdAt) })] }, resource.id))) })] }), _jsxs("div", { className: "flex items-center justify-between mt-4 pt-4 border-t", children: [_jsxs("div", { className: "text-sm text-gray-600", children: ["Showing ", data?.items.length || 0, " of ", data?.total || 0, " resources"] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { variant: "outline", size: "sm", onClick: () => setPage((p) => Math.max(1, p - 1)), disabled: page === 1, children: "Previous" }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => setPage((p) => p + 1), disabled: !data || page >= data.totalPages, children: "Next" })] })] })] })) })] })] }));
}
//# sourceMappingURL=ResourcesPage.js.map