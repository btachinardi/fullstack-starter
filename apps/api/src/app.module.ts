import { BaseAppModule } from "@libs/platform/api";
import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { LinksModule } from "./links/links.module";

@Module({
	imports: [
		BaseAppModule, // Provides: Health checks, and future common functionality
		LinksModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
