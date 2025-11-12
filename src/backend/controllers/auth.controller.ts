import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

class LoginDto {
  email!: string;
  password!: string;
}

class RegisterDto {
  email!: string;
  password!: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

class RefreshTokenDto {
  refreshToken!: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('admin/login')
  @HttpCode(HttpStatus.OK)
  async adminLogin(@Body() loginDto: LoginDto) {
    const result = await this.authService.loginAdmin(
      loginDto.email,
      loginDto.password,
    );
    return {
      success: true,
      data: result,
      message: 'Connexion réussie',
    };
  }

  @Post('customer/login')
  @HttpCode(HttpStatus.OK)
  async customerLogin(@Body() loginDto: LoginDto) {
    const result = await this.authService.loginCustomer(
      loginDto.email,
      loginDto.password,
    );
    return {
      success: true,
      data: result,
      message: 'Connexion réussie',
    };
  }

  @Post('customer/register')
  @HttpCode(HttpStatus.CREATED)
  async customerRegister(@Body() registerDto: RegisterDto) {
    const customer = await this.authService.registerCustomer(registerDto);
    const loginResult = await this.authService.loginCustomer(
      registerDto.email,
      registerDto.password,
    );

    return {
      success: true,
      data: loginResult,
      message: 'Compte créé avec succès',
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    const result = await this.authService.refreshToken(
      refreshTokenDto.refreshToken,
    );
    return {
      success: true,
      data: result,
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req: any) {
    return {
      success: true,
      data: req.user,
    };
  }
}


