"use client";

import { Avatar, AvatarFallback } from "@libs/core/ui/components/avatar";
import { Badge } from "@libs/core/ui/components/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@libs/core/ui/components/card";
import { Mail, Phone } from "lucide-react";

export default function TeamPage() {
	const team = [
		{
			name: "Alice Johnson",
			role: "Product Manager",
			email: "alice@example.com",
			phone: "+1 (555) 123-4567",
			status: "active",
		},
		{
			name: "Bob Smith",
			role: "Lead Developer",
			email: "bob@example.com",
			phone: "+1 (555) 234-5678",
			status: "active",
		},
		{
			name: "Carol Williams",
			role: "UX Designer",
			email: "carol@example.com",
			phone: "+1 (555) 345-6789",
			status: "away",
		},
		{
			name: "David Brown",
			role: "Backend Engineer",
			email: "david@example.com",
			phone: "+1 (555) 456-7890",
			status: "active",
		},
	];

	return (
		<div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
			<div className="flex items-center justify-between">
				<h2 className="text-3xl font-bold tracking-tight">Team</h2>
				<Badge variant="outline">{team.length} members</Badge>
			</div>

			<div className="grid gap-4 md:grid-cols-2">
				{team.map((member) => (
					<Card key={member.email}>
						<CardHeader>
							<div className="flex items-center gap-4">
								<Avatar className="h-12 w-12">
									<AvatarFallback>
										{member.name
											.split(" ")
											.map((n) => n[0])
											.join("")}
									</AvatarFallback>
								</Avatar>
								<div className="flex-1">
									<CardTitle className="text-lg">{member.name}</CardTitle>
									<CardDescription>{member.role}</CardDescription>
								</div>
								<Badge
									variant={member.status === "active" ? "default" : "secondary"}
								>
									{member.status}
								</Badge>
							</div>
						</CardHeader>
						<CardContent className="space-y-2">
							<div className="flex items-center gap-2 text-sm text-muted-foreground">
								<Mail className="h-4 w-4" />
								{member.email}
							</div>
							<div className="flex items-center gap-2 text-sm text-muted-foreground">
								<Phone className="h-4 w-4" />
								{member.phone}
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
