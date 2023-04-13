import { Controller, Post, HttpException, Body, Delete, 
  UseGuards, HttpStatus, HttpCode, 
  Headers, Param, Get,
 } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IsGuestGuard } from '../../guards/isGuest/isGuest';
import { AccountsService } from './accounts.service';
import { RegisterDto } from './dto/register-dto';
import { LoginDto } from './dto/login-dto';
import { ICreatedSession, IRequestHeaders, IUsernameExistsRequestParams } from '../../interfaces';
import { IsLoggedInGuard } from '../../guards/isLoggedIn/isLoggedIn';

@ApiBearerAuth('jwt')
@ApiTags('accounts')
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

  @Post('session')
  @ApiResponse({ status: HttpStatus.CREATED, description: 'User has a valid session'})
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'User does not have a valid session'})
  @UseGuards(IsLoggedInGuard)
  async checkSession(@Headers() headers: IRequestHeaders): Promise<ICreatedSession> {
    const session = await this.accountsService.generateUserFromJWT(headers.authorization);
    return session;
  }
  
  @Get('username/:username')
  @ApiResponse({ status: HttpStatus.OK, description: 'Username exists' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Username does not exist' })
  @ApiParam({
    name: 'username',
    description: 'Will check if the given username exists',
  })
  async checkIfUsernameExists(@Param() params: IUsernameExistsRequestParams): Promise<{}> {
    const { username } = params;
    
    const user = await this.accountsService.checkIfUsernameExists(username);
    if (!user) {
      throw new HttpException({}, HttpStatus.NOT_FOUND);
    }

    return {};
  }
}
