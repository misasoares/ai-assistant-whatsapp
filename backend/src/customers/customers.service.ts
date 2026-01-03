import { Injectable, ConflictException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Customer, Instance, Plan, InstanceStatus } from '@prisma/client';
import { EvolutionService } from '../evolution/evolution.service';

@Injectable()
export class CustomersService {
  private readonly logger = new Logger(CustomersService.name);

  constructor(
    private prisma: PrismaService,
    private evolutionService: EvolutionService,
  ) {}

  async create(data: { name: string; email?: string; phone?: string; plan?: Plan }): Promise<Customer> {
    if (data.email) {
      const existing = await this.prisma.customer.findUnique({
        where: { email: data.email },
      });

      if (existing) {
        throw new ConflictException('Customer with this email already exists');
      }
    }

    return this.prisma.customer.create({
      data: {
        ...data,
        plan: data.plan || Plan.FREE,
      },
    });
  }

  async findAll(): Promise<Customer[]> {
    return this.prisma.customer.findMany({
      include: {
        _count: {
          select: { instances: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string): Promise<Customer & { instances: Instance[] }> {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        instances: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // Sync instance status
    const updatedInstances = await Promise.all(
      customer.instances.map(async (instance) => {
        try {
          const evoState = await this.evolutionService.getInstance(instance.name);
          const rawState = evoState?.instance?.state;
          const state = this.mapToInstanceStatus(rawState);
          
          if (state !== instance.status) {
             this.logger.log(`Updating status for instance ${instance.name}: ${instance.status} -> ${state}`);
             return this.prisma.instance.update({
               where: { id: instance.id },
               data: { status: state },
             });
          }
        } catch (error) {
           this.logger.warn(`Failed to sync status for instance ${instance.name}: ${error.message}`);
        }
        return instance;
      })
    );
    
    // Refresh customer with updated instances
    // Alternatively, just return the customer with the mutated instances array, but fetching fresh is cleaner/safer
    return { ...customer, instances: updatedInstances };
  }

  async update(id: string, data: { name?: string; plan?: Plan; email?: string; phone?: string }): Promise<Customer> {
    const customer = await this.prisma.customer.findUnique({ where: { id } });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return this.prisma.customer.update({
      where: { id },
      data,
    });
  }

  async remove(id: string): Promise<void> {
    const customer = await this.prisma.customer.findUnique({ where: { id } });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    await this.prisma.customer.delete({
      where: { id },
    });
  }

  private mapToInstanceStatus(status: string | undefined): InstanceStatus {
    if (!status) return InstanceStatus.DISCONNECTED;
    
    // Map Evolution API status strings to our Enum
    const normalize = status.toUpperCase();
    switch (normalize) {
        case 'OPEN': return InstanceStatus.OPEN;
        case 'CLOSE': return InstanceStatus.CLOSE;
        case 'CONNECTING': return InstanceStatus.CONNECTING;
        case 'CONNECTED': return InstanceStatus.CONNECTED;
        case 'DISCONNECTED': return InstanceStatus.DISCONNECTED;
        default: return InstanceStatus.DISCONNECTED;
    }
  }
}
