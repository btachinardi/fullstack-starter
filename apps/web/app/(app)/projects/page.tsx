"use client";

import { Badge } from "@libs/core/ui/components/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@libs/core/ui/components/card";
import { FolderKanban } from "lucide-react";

export default function ProjectsPage() {
	const projects = [
		{
			name: "E-commerce Platform",
			status: "In Progress",
			team: "5 members",
			progress: 75,
		},
		{
			name: "Mobile App Redesign",
			status: "Planning",
			team: "3 members",
			progress: 25,
		},
		{
			name: "API v2 Migration",
			status: "In Progress",
			team: "8 members",
			progress: 60,
		},
		{
			name: "Dashboard Analytics",
			status: "Completed",
			team: "4 members",
			progress: 100,
		},
	];

	return (
		<div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
			<div className="flex items-center justify-between">
				<h2 className="text-3xl font-bold tracking-tight">Projects</h2>
				<Badge variant="outline">{projects.length} total</Badge>
			</div>

			<div className="grid gap-4 md:grid-cols-2">
				{projects.map((project) => (
					<Card key={project.name}>
						<CardHeader>
							<div className="flex items-start justify-between">
								<div className="space-y-1">
									<CardTitle className="flex items-center gap-2">
										<FolderKanban className="h-5 w-5" />
										{project.name}
									</CardTitle>
									<CardDescription>{project.team}</CardDescription>
								</div>
								<Badge
									variant={
										project.status === "Completed"
											? "default"
											: project.status === "In Progress"
												? "secondary"
												: "outline"
									}
								>
									{project.status}
								</Badge>
							</div>
						</CardHeader>
						<CardContent>
							<div className="space-y-2">
								<div className="flex items-center justify-between text-sm">
									<span className="text-muted-foreground">Progress</span>
									<span className="font-medium">{project.progress}%</span>
								</div>
								<div className="h-2 w-full rounded-full bg-secondary">
									<div
										className="h-full rounded-full bg-primary transition-all"
										style={{ width: `${project.progress}%` }}
									/>
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
