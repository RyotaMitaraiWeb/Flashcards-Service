import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpStatus, Req, Response, HttpCode, Headers } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiResponse } from '@nestjs/swagger';
import { IsGuestGuard } from '../../guards/isGuest';
import { AccountsService } from './accounts.service';
import { RegisterDto } from './dto/register-dto';
import { LoginDto } from './dto/login-dto';
import { ICreatedSession, IRequest, IRequestHeaders } from '../../interfaces';
import { extractTokenFromHeader } from '../../util/extractTokenFromHeader/extractTokenFromHeader';
import { log } from 'console';
import { jwtBlacklist } from './jwtBlacklist';
import { IsLoggedInGuard } from '../../guards/isLoggedIn';

@ApiBearerAuth('jwt')
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) { }

  @Post('register')
  @UseGuards(IsGuestGuard)
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Account has been created successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'The submission failed validation' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'A valid JWT was detected in the Authorization header' })
  async register(@Body() registerDto: RegisterDto): Promise<ICreatedSession> {
    const user = await this.accountsService.register(registerDto);
    const token = await this.accountsService.generateToken(user);
    return { token, user };
  }

  @Post('login')
  @UseGuards(IsGuestGuard)
  @ApiResponse({ status: HttpStatus.CREATED, description: 'User logged in successfully' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'The provided username or password is wrong' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'A valid JWT was detected in the Authorization header' })
  async login(@Body() loginDto: LoginDto): Promise<ICreatedSession> {
    const user = await this.accountsService.login(loginDto);
    const token = await this.accountsService.generateToken(user);
    return { token, user };
  }

  @Delete('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'User logged out successfully '})
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Invalid or missing JWT'})
  @UseGuards(IsLoggedInGuard)
  logout(@Headers() headers: IRequestHeaders) {
    const bearerToken = headers.authorization;
    this.accountsService.logout(bearerToken);
    return {};
  }
}
