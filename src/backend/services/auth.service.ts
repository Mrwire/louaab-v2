import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AdminUser } from '../entities/admin-user.entity';
import { Customer } from '../entities/customer.entity';

export interface JwtPayload {
  sub: string;
  email: string;
  role?: string;
  type: 'admin' | 'customer';
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AdminUser)
    private adminUserRepository: Repository<AdminUser>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    private jwtService: JwtService,
  ) {}

  async validateAdmin(email: string, password: string): Promise<AdminUser> {
    const admin = await this.adminUserRepository.findOne({
      where: { email, isActive: true },
    });

    if (!admin) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    // Update last login
    admin.lastLogin = new Date();
    await this.adminUserRepository.save(admin);

    return admin;
  }

  async validateCustomer(email: string, password: string): Promise<Customer> {
    const customer = await this.customerRepository.findOne({
      where: { email, isActive: true },
    });

    if (!customer || !customer.passwordHash) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      customer.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    return customer;
  }

  async loginAdmin(email: string, password: string) {
    const admin = await this.validateAdmin(email, password);

    const payload: JwtPayload = {
      sub: admin.id,
      email: admin.email,
      role: admin.role,
      type: 'admin',
    };

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '30d' }),
      user: {
        id: admin.id,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: admin.role,
      },
    };
  }

  async loginCustomer(email: string, password: string) {
    const customer = await this.validateCustomer(email, password);

    const payload: JwtPayload = {
      sub: customer.id,
      email: customer.email,
      type: 'customer',
    };

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '30d' }),
      user: {
        id: customer.id,
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
      },
    };
  }

  async registerCustomer(data: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  }): Promise<Customer> {
    // Check if customer already exists
    const existing = await this.customerRepository.findOne({
      where: { email: data.email },
    });

    if (existing) {
      throw new UnauthorizedException('Un compte avec cet email existe déjà');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 10);

    // Create customer
    const customer = this.customerRepository.create({
      ...data,
      passwordHash,
    });

    return this.customerRepository.save(customer);
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  verifyToken(token: string): JwtPayload {
    try {
      return this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException('Token invalide');
    }
  }

  async refreshToken(refreshToken: string) {
    const payload = this.verifyToken(refreshToken);

    const newPayload: JwtPayload = {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
      type: payload.type,
    };

    return {
      access_token: this.jwtService.sign(newPayload),
      refresh_token: this.jwtService.sign(newPayload, { expiresIn: '30d' }),
    };
  }
}


