export interface OrderItem {
  toyName: string;
  duration: string;
  startDate: string;
  quantity: number;
  price: number;
  stockQuantity?: number;
  availableQuantity?: number;
  imageUrl?: string;
}

export interface Order {
  id: string;
  orderNumber?: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress?: string;
  items: OrderItem[];
  totalPrice: number;
  depositAmount?: number;
  status: 'pending' | 'confirmed' | 'delivered' | 'returned' | 'completed' | 'cancelled';
  createdAt: string;
  notes?: string;
}

// Données de commandes réalistes pour le Maroc
const sampleOrders: Order[] = [
  {
    id: "ORD-20241201-001",
    customerName: "Fatima Alami",
    customerPhone: "+212 6 12 34 56 78",
    items: [
      {
        toyName: "Puzzle éducatif 3D",
        duration: "1 mois",
        startDate: "2024-12-01",

        quantity: 1,
        price: 199
      }
    ],
    totalPrice: 199,
    status: "pending",
    createdAt: "2024-12-01T10:30:00Z",
    notes: "Livraison préférée en fin d'après-midi"
  },
  {
    id: "ORD-20241130-002",
    customerName: "Ahmed Benali",
    customerPhone: "+212 6 23 45 67 89",
    items: [
      {
        toyName: "Kit de construction LEGO",
        duration: "2 mois",
        startDate: "2024-11-30",

        quantity: 1,
        price: 349
      },
      {
        toyName: "Jeu de société éducatif",
        duration: "1 mois",
        startDate: "2024-11-30",

        quantity: 1,
        price: 149
      }
    ],
    totalPrice: 498,
    status: "confirmed",
    createdAt: "2024-11-30T15:45:00Z",
    notes: "Client fidèle, préfère les jouets éducatifs"
  },
  {
    id: "ORD-20241129-003",
    customerName: "Aicha Tazi",
    customerPhone: "+212 6 34 56 78 90",
    items: [
      {
        toyName: "Poupée interactive",
        duration: "1 mois",
        startDate: "2024-11-29",

        quantity: 1,
        price: 199
      }
    ],
    totalPrice: 199,
    status: "completed",
    createdAt: "2024-11-29T09:20:00Z"
  },
  {
    id: "ORD-20241128-004",
    customerName: "Omar El Fassi",
    customerPhone: "+212 6 45 67 89 01",
    items: [
      {
        toyName: "Voiture télécommandée",
        duration: "1 mois",
        startDate: "2024-11-28",

        quantity: 1,
        price: 299
      },
      {
        toyName: "Train électrique",
        duration: "1 mois",
        startDate: "2024-11-28",

        quantity: 1,
        price: 249
      }
    ],
    totalPrice: 548,
    status: "completed",
    createdAt: "2024-11-28T14:15:00Z"
  },
  {
    id: "ORD-20241127-005",
    customerName: "Khadija Mrani",
    customerPhone: "+212 6 56 78 90 12",
    items: [
      {
        toyName: "Kit de peinture créative",
        duration: "1 mois",
        startDate: "2024-11-27",

        quantity: 1,
        price: 149
      }
    ],
    totalPrice: 149,
    status: "cancelled",
    createdAt: "2024-11-27T12:30:00Z",
    notes: "Annulé par le client - changement de plan"
  },
  {
    id: "ORD-20241126-006",
    customerName: "Youssef Alaoui",
    customerPhone: "+212 6 67 89 01 23",
    items: [
      {
        toyName: "Jeu de construction magnétique",
        duration: "2 mois",
        startDate: "2024-11-26",

        quantity: 1,
        price: 399
      }
    ],
    totalPrice: 399,
    status: "pending",
    createdAt: "2024-11-26T16:45:00Z",
    notes: "Nouveau client, très intéressé par les jouets éducatifs"
  },
  {
    id: "ORD-20241125-007",
    customerName: "Naima Berrada",
    customerPhone: "+212 6 78 90 12 34",
    items: [
      {
        toyName: "Piano pour enfants",
        duration: "1 mois",
        startDate: "2024-11-25",

        quantity: 1,
        price: 199
      },
      {
        toyName: "Xylophone coloré",
        duration: "1 mois",
        startDate: "2024-11-25",

        quantity: 1,
        price: 149
      }
    ],
    totalPrice: 348,
    status: "confirmed",
    createdAt: "2024-11-25T09:30:00Z"
  },
  {
    id: "ORD-20241124-008",
    customerName: "Hassan Idrissi",
    customerPhone: "+212 6 89 01 23 45",
    items: [
      {
        toyName: "Robot programmable",
        duration: "1 mois",
        startDate: "2024-11-24",

        quantity: 1,
        price: 499
      }
    ],
    totalPrice: 499,
    status: "completed",
    createdAt: "2024-11-24T17:20:00Z"
  }
];

export class OrderManager {
  private static STORAGE_KEY = 'louaab-orders';

  static generateOrderId(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `ORD-${timestamp}-${random}`;
  }

  // Initialiser avec des données d'exemple si aucune donnée n'existe
  static initializeSampleData(): void {
    if (typeof window === 'undefined') return;

    const existingOrders = this.getAllOrders();
    if (existingOrders.length === 0) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sampleOrders));
    }
  }

  static saveOrder(order: Order): void {
    const orders = this.getAllOrders();
    orders.push(order);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(orders));
  }

  static getAllOrders(): Order[] {
    try {
      const orders = localStorage.getItem(this.STORAGE_KEY);
      return orders ? JSON.parse(orders) : [];
    } catch (error) {
      console.error('Erreur lors du chargement des commandes:', error);
      return [];
    }
  }

  static updateOrderStatus(orderId: string, status: Order['status']): void {
    const orders = this.getAllOrders();
    const updatedOrders = orders.map(order =>
      order.id === orderId ? { ...order, status } : order
    );
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedOrders));
  }

  static getOrderById(orderId: string): Order | null {
    const orders = this.getAllOrders();
    return orders.find(order => order.id === orderId) || null;
  }

  static getOrdersByStatus(status: Order['status']): Order[] {
    const orders = this.getAllOrders();
    return orders.filter(order => order.status === status);
  }

  static getPendingOrders(): Order[] {
    return this.getOrdersByStatus('pending');
  }

  static getOrdersCount(): number {
    return this.getAllOrders().length;
  }

  static getPendingOrdersCount(): number {
    return this.getPendingOrders().length;
  }

  static getTotalRevenue(): number {
    const orders = this.getAllOrders();
    return orders.reduce((sum, order) => sum + order.totalPrice, 0);
  }
}
