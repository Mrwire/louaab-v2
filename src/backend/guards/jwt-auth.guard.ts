import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('Token invalide ou expiré');
    }
    return user;
  }
}

@Injectable()
export class AdminAuthGuard extends JwtAuthGuard {
  handleRequest(err: any, user: any, info: any) {
    const validatedUser = super.handleRequest(err, user, info);

    if (validatedUser.type !== 'admin') {
      throw new UnauthorizedException('Accès réservé aux administrateurs');
    }

    return validatedUser;
  }
}

@Injectable()
export class CustomerAuthGuard extends JwtAuthGuard {
  handleRequest(err: any, user: any, info: any) {
    const validatedUser = super.handleRequest(err, user, info);

    if (validatedUser.type !== 'customer') {
      throw new UnauthorizedException('Accès réservé aux clients');
    }

    return validatedUser;
  }
}


