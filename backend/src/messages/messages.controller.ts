import { Controller, Post, Body, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { MessagesService } from './messages.service';

@Controller('messages')
export class MessagesController {
  private readonly logger = new Logger(MessagesController.name);

  constructor(private readonly messagesService: MessagesService) {}

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(@Body() payload: any) {
    console.log('--- WEBHOOK PAYLOAD START ---');
    console.log(JSON.stringify(payload, null, 2));
    console.log('--- WEBHOOK PAYLOAD END ---');
    this.logger.debug(`Received webhook payload: ${JSON.stringify(payload)}`);
    // Evolution API sends various events. We are interested in "messages.upsert" usually
    // But structure depends on Evolution API version.
    // Assuming standard Evolution v2 structure where type is in the body or event identifier
    
    // We delegate full payload processing to service
    await this.messagesService.handleWebhook(payload);
    
    return { status: 'received' };
  }
}
