import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class EvolutionService {
  private readonly logger = new Logger(EvolutionService.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('EVOLUTION_API_URL') || 'http://localhost:8080';
    this.apiKey = this.configService.get<string>('EVOLUTION_API_KEY') || '';
  }

  async createInstance(instanceName: string) {
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
      
      this.logger.log(`Instance ${instanceName} created successfully`);
      return response.data;
    } catch (error) {
      const status = error.response?.status;
      const errorData = error.response?.data;
      this.logger.error(
        `Error creating instance ${instanceName}: Status ${status} - ${JSON.stringify(errorData || error.message)}`,
      );
      
      if (status) {
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
      const status = error.response?.status;
      this.logger.error(
        `Error fetching instance ${instanceName}: Status ${status} - ${error.message}`,
      );
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

  async fetchLastMessages(instanceName: string) {
    try {
      this.logger.log(`Fetching last messages for instance: ${instanceName}`);
      
      // 1. Get most recent chat
      const chatsResponse = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/chat/findChats/${instanceName}`,
          {},
          {
            headers: {
              apikey: this.apiKey,
            },
          },
        ),
      );

      const chats = chatsResponse.data;
      if (!chats || chats.length === 0) {
        this.logger.log(`No chats found for instance: ${instanceName}`);
        return [];
      }

      const mostRecentChat = chats[0];
      const remoteJid = mostRecentChat.remoteJid;
      this.logger.log(`Most recent chat: ${remoteJid}`);

      // 2. Get last 5 messages for this chat
      const messagesResponse = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/chat/findMessages/${instanceName}`,
          {
            where: {
              key: {
                remoteJid: remoteJid,
              },
            },
            offset: 5,
          },
          {
            headers: {
              apikey: this.apiKey,
            },
          },
        ),
      );

      return messagesResponse.data.messages?.records || [];
    } catch (error) {
      const status = error.response?.status;
      this.logger.error(
        `Error fetching last messages for ${instanceName}: Status ${status} - ${error.message}`,
      );
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

  async fetchRecentMessages(instanceName: string, chatCount: number = 5, messageCount: number = 5) {
    try {
      this.logger.log(`Fetching recent messages for instance: ${instanceName} (chats: ${chatCount}, messages: ${messageCount})`);
      
      // 1. Get recent chats
      const chatsResponse = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/chat/findChats/${instanceName}`,
          {
            take: chatCount,
          },
          {
            headers: {
              apikey: this.apiKey,
            },
          },
        ),
      );

      const chats = chatsResponse.data;
      if (!chats || !Array.isArray(chats)) {
        this.logger.log(`No chats found for instance: ${instanceName}`);
        return [];
      }

      // 2. For each chat, fetch its last N messages
      const results = await Promise.all(
        chats.map(async (chat: any) => {
          const remoteJid = chat.remoteJid;
          try {
            const messagesResponse = await firstValueFrom(
              this.httpService.post(
                `${this.baseUrl}/chat/findMessages/${instanceName}`,
                {
                  where: {
                    key: {
                      remoteJid: remoteJid,
                    },
                  },
                  offset: messageCount,
                },
                {
                  headers: {
                    apikey: this.apiKey,
                  },
                },
              ),
            );

            return {
              user: chat.pushName || remoteJid,
              remoteJid: remoteJid,
              profilePicUrl: chat.profilePicUrl,
              messages: messagesResponse.data.messages?.records || [],
            };
          } catch (error) {
            this.logger.error(`Error fetching messages for chat ${remoteJid}: ${error.message}`);
            return {
              user: chat.pushName || remoteJid,
              remoteJid: remoteJid,
              profilePicUrl: chat.profilePicUrl,
              messages: [],
            };
          }
        }),
      );

      return results;
    } catch (error) {
      const status = error.response?.status;
      this.logger.error(
        `Error in fetchRecentMessages for ${instanceName}: Status ${status} - ${error.message}`,
      );
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
}
