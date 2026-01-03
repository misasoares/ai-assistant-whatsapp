import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';
import { InstanceStatus } from '@prisma/client';

@Injectable()
export class EvolutionService {
  private readonly logger = new Logger(EvolutionService.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.baseUrl = this.configService.get<string>('EVOLUTION_API_URL') || 'http://localhost:8080';
    this.apiKey = this.configService.get<string>('EVOLUTION_API_KEY') || '';
  }

  async createInstance(data: { instanceName: string; customerId: string }) {
    const { instanceName, customerId } = data;

    // Check for duplicate locally
    const existing = await this.prisma.instance.findUnique({
      where: { name: instanceName },
    });

    if (existing) {
      throw new ConflictException('Instance name already exists');
    }

    try {
      this.logger.log(`Attempting to create instance: ${instanceName} at ${this.baseUrl}`);
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/instance/create`,
          {
            instanceName,
            integration: 'WHATSAPP-BAILEYS',
            qrcode: true,
          },
          {
            headers: {
              apikey: this.apiKey,
              'Content-Type': 'application/json',
            },
          },
        ),
      );
      
      this.logger.log(`Instance ${instanceName} created in Evolution API`);

      // Save to database
      const instance = await this.prisma.instance.create({
        data: {
          name: instanceName,
          customerId,
          status: InstanceStatus.DISCONNECTED, // Initial status
          evolutionKey: response.data?.hash?.apikey, // Assuming Evolution returns API key for the instance if applicable
        },
      });

      return { ...response.data, dbInstance: instance };
    } catch (error) {
      const status = error.response?.status;
      const errorData = error.response?.data;
      this.logger.error(
        `Error creating instance ${instanceName}: Status ${status} - ${JSON.stringify(errorData || error.message)}`,
      );
      
      if (status) {
         // Check if it's a conflict in Evolution API but not in our DB (edge case)
         if (status === 409 || (errorData && errorData.error === 'Instance already exists')) {
             throw new ConflictException('Instance already exists in Evolution API');
         }

        throw {
          response: {
            status,
            data: errorData
          }
        };
      }
      throw error;
    }
  }

  async updateInstance(name: string, data: { aiEnabled?: boolean; systemPrompt?: string; silentModeTime?: number }) {
    return this.prisma.instance.update({
      where: { name },
      data,
    });
  }

  async getInstance(instanceName: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/instance/connectionState/${instanceName}`, {
          headers: {
            apikey: this.apiKey,
          },
        }),
      );
      return response.data;
    } catch (error) {
       // Gracefully handle if instance doesn't exist in Evolution but exists in DB (sync issue)
      const status = error.response?.status;
      this.logger.error(
        `Error fetching instance ${instanceName}: Status ${status} - ${error.message}`,
      );
      if (status === 404) {
         return { instance: { state: 'not_found' } };
      }
      
      if (status) {
        throw {
          response: {
            status,
            data: error.response?.data
          }
        };
      }
      throw error;
    }
  }

  async deleteInstance(name: string) {
    this.logger.log(`Attempting to delete instance ${name}`);
    
    // 1. Delete from Evolution API (Hard delete on provider side to free resources)
    try {
        await firstValueFrom(
            this.httpService.delete(`${this.baseUrl}/instance/delete/${name}`, {
                headers: {
                    apikey: this.apiKey
                }
            })
        );
        this.logger.log(`Instance ${name} deleted from Evolution API`);
    } catch (error) {
        this.logger.warn(`Failed to delete instance ${name} from Evolution API: ${error.message}`);
        // Continue to soft delete locally even if remote delete fails (or already doesn't exist)
    }

    // 2. Soft Delete in Database (Instance + Embeddings)
    // We use a transaction to ensure both are updated
    return this.prisma.$transaction(async (tx) => {
        const instance = await tx.instance.findUnique({ where: { name } });
        if (!instance) {
             throw new Error('Instance not found');
        }

        // Soft delete embeddings
        await tx.documentEmbedding.updateMany({
            where: { instanceId: instance.id },
            data: { deletedAt: new Date() }
        });

        // Soft delete instance
        return tx.instance.update({
            where: { id: instance.id },
            data: { 
                status: InstanceStatus.DELETED,
                deletedAt: new Date() 
            }
        });
    });
  }

  async sendText(instanceName: string, remoteJid: string, text: string) {
    try {
      this.logger.log(`Sending message to ${remoteJid} via ${instanceName}`);
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/message/sendText/${instanceName}`,
          {
            number: remoteJid,
            text: text,
          },
          {
            headers: {
              apikey: this.apiKey,
              'Content-Type': 'application/json',
            },
          },
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(
        `Error sending message to ${remoteJid}: ${error.message}`,
      );
      throw error;
    }
  }
}
