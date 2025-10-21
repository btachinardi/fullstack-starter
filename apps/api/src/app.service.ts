import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): { message: string; timestamp: string } {
    return {
      message: 'Welcome to Fullstack Starter API',
      timestamp: new Date().toISOString(),
    };
  }
}
