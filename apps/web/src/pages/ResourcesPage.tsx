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
    return (
      <div className="p-8">
        <Card>
          <CardHeader>
            <CardTitle>Error Loading Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">{String(error)}</p>
            <Button onClick={() => refetch()} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Resources</h1>
        <p className="text-gray-600">Manage your resources</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Resources</CardTitle>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : data?.items.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No resources found</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.items.map((resource) => (
                    <TableRow key={resource.id}>
                      <TableCell className="font-medium">{resource.name}</TableCell>
                      <TableCell>{resource.description || '-'}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            resource.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {resource.status}
                        </span>
                      </TableCell>
                      <TableCell>{formatRelativeTime(resource.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="text-sm text-gray-600">
                  Showing {data?.items.length || 0} of {data?.total || 0} resources
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={!data || page >= data.totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
