import { Module } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { AccountsController } from './accounts.controller';
import { JwtService } from '@nestjs/jwt';
import { Account } from './entities/account.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UniqueUsernameValidator } from '../../custom-validators/uniqueUsername';

/**
 * This module handles controllers, services, and entities related to the users' accounts when authenticating
 */
@Module({
  controllers: [AccountsController],
  providers: [AccountsService, JwtService, UniqueUsernameValidator],
  imports: [TypeOrmModule.forFeature([Account])],
  exports: [AccountsService],
})
export class AccountsModule {}
