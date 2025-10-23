"use client";

import { Badge } from "@libs/core/ui/components/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@libs/core/ui/components/card";
import {
	Activity,
	CreditCard,
	DollarSign,
	TrendingDown,
	TrendingUp,
	Users,
} from "lucide-react";

export default function DashboardPage() {
	return (
		<div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
			{/* Stats Grid */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
						<DollarSign className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">$45,231.89</div>
						<div className="flex items-center gap-2 text-xs text-muted-foreground">
							<Badge variant="outline" className="gap-1">
								<TrendingUp className="h-3 w-3" />
								+20.1%
							</Badge>
							<span>from last month</span>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Active Users</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">+2,350</div>
						<div className="flex items-center gap-2 text-xs text-muted-foreground">
							<Badge variant="outline" className="gap-1">
								<TrendingUp className="h-3 w-3" />
								+18.2%
							</Badge>
							<span>from last month</span>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Sales</CardTitle>
						<CreditCard className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">+12,234</div>
						<div className="flex items-center gap-2 text-xs text-muted-foreground">
							<Badge variant="outline" className="gap-1">
								<TrendingDown className="h-3 w-3" />
								-4.3%
							</Badge>
							<span>from last month</span>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Active Now</CardTitle>
						<Activity className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">+573</div>
						<div className="flex items-center gap-2 text-xs text-muted-foreground">
							<Badge variant="outline" className="gap-1">
								<TrendingUp className="h-3 w-3" />
								+201
							</Badge>
							<span>since last hour</span>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Recent Activity */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
				<Card className="md:col-span-4">
					<CardHeader>
						<CardTitle>Recent Activity</CardTitle>
						<CardDescription>You made 265 actions this month.</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-8">
							{[
								{
									name: "Project Alpha",
									action: "Updated",
									time: "2 hours ago",
									amount: "+$1,999.00",
								},
								{
									name: "Team Meeting",
									action: "Scheduled",
									time: "4 hours ago",
									amount: null,
								},
								{
									name: "Client Proposal",
									action: "Sent",
									time: "1 day ago",
									amount: "+$5,999.00",
								},
								{
									name: "Design Review",
									action: "Completed",
									time: "2 days ago",
									amount: null,
								},
								{
									name: "Q4 Planning",
									action: "Created",
									time: "3 days ago",
									amount: null,
								},
							].map((item, index) => (
								<div key={index} className="flex items-center">
									<div className="space-y-1 flex-1">
										<p className="text-sm font-medium leading-none">
											{item.name}
										</p>
										<p className="text-sm text-muted-foreground">
											{item.action} • {item.time}
										</p>
									</div>
									{item.amount && (
										<div className="ml-auto font-medium">{item.amount}</div>
									)}
								</div>
							))}
						</div>
					</CardContent>
				</Card>

				<Card className="md:col-span-3">
					<CardHeader>
						<CardTitle>Quick Stats</CardTitle>
						<CardDescription>Overview of key metrics</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center justify-between">
							<span className="text-sm text-muted-foreground">
								Conversion Rate
							</span>
							<span className="text-sm font-medium">3.2%</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-sm text-muted-foreground">
								Avg. Order Value
							</span>
							<span className="text-sm font-medium">$89.50</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-sm text-muted-foreground">
								Customer Satisfaction
							</span>
							<span className="text-sm font-medium">4.8/5.0</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-sm text-muted-foreground">
								Response Time
							</span>
							<span className="text-sm font-medium">1.2s</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-sm text-muted-foreground">Uptime</span>
							<span className="text-sm font-medium">99.9%</span>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
