import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiResponse } from '@nestjs/swagger';
import { IsGuestGuard } from '../../guards/isGuest';
import { AccountsService } from './accounts.service';
import { RegisterDto } from './dto/register-dto';
import { LoginDto } from './dto/login-dto';

@ApiBearerAuth('jwt')
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) { }

  @Post('register')
  @UseGuards(IsGuestGuard)
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Account has been created successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'The submission failed validation' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'A valid JWT was detected in the Authorization header' })
  async register(@Body() registerDto: RegisterDto) {
    const user = await this.accountsService.register(registerDto);
    const token = await this.accountsService.generateToken(user);
    return { token };
  }

  @Post('login')
  @UseGuards(IsGuestGuard)
  @ApiResponse({ status: HttpStatus.CREATED, description: 'User logged in successfully' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'The provided username or password is wrong' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'A valid JWT was detected in the Authorization header' })
  async login(@Body() loginDto: LoginDto) {
    const user = await this.accountsService.login(loginDto);
    const token = await this.accountsService.generateToken(user);
    return { token };
  }
}
