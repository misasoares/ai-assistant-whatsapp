import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class EvolutionService {
  private readonly logger = new Logger(EvolutionService.name);
  private readonly baseUrl = 'http://localhost:8080'; // Default Evolution API URL

  constructor(private readonly httpService: HttpService) {}

  async checkInstance(instanceName: string) {
    try {
      // Example endpoint to check instance status
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/instance/fetchInstances`),
      );
      this.logger.log('Evolution API Connection Successful');
      return response.data;
    } catch (error) {
      this.logger.error('Error connecting to Evolution API', error);
      throw error;
    }
  }

  // Example method to create an instance
  async createInstance(instanceName: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/instance/create`, {
          instanceName,
          token:  'my-secret-token', // Should be in env variables
          qrcode: true,
        }),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Error creating instance ${instanceName}`, error);
      throw error;
    }
  }
}
