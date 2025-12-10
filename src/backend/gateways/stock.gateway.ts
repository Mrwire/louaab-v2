import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';

export interface StockUpdateEvent {
    toyId: string;
    slug?: string;
    name?: string;
    stockQuantity: number;
    availableQuantity: number;
    status: string;
    timestamp: number;
}

@Injectable()
@WebSocketGateway({
    cors: {
        origin: ['https://louaab.ma', 'https://www.louaab.ma', 'http://localhost:3000'],
        credentials: true,
    },
    namespace: '/stock',
})
export class StockGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly logger = new Logger(StockGateway.name);

    @WebSocketServer()
    server!: Server;

    private connectedClients = 0;

    handleConnection(client: Socket) {
        this.connectedClients++;
        this.logger.log(`Client connected: ${client.id} (${this.connectedClients} total)`);
    }

    handleDisconnect(client: Socket) {
        this.connectedClients--;
        this.logger.log(`Client disconnected: ${client.id} (${this.connectedClients} total)`);
    }

    /**
     * Emit stock update to all connected clients
     */
    emitStockUpdate(update: StockUpdateEvent) {
        this.logger.debug(`Emitting stock update for toy ${update.toyId}: stock=${update.stockQuantity}`);
        this.server?.emit('stock:updated', update);
    }

    /**
     * Emit bulk stock updates (e.g., after order confirmation)
     */
    emitBulkStockUpdate(updates: StockUpdateEvent[]) {
        this.logger.debug(`Emitting bulk stock update for ${updates.length} toys`);
        this.server?.emit('stock:bulk-updated', { toys: updates, timestamp: Date.now() });
    }

    /**
     * Get number of connected clients
     */
    getConnectedClientsCount(): number {
        return this.connectedClients;
    }
}
