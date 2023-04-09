import { Controller, Get, Post, Body, Patch, Param, Delete, Headers, Req, UseGuards, HttpStatus } from '@nestjs/common';
import { DecksService } from './decks.service';
import { CreateDeckDto } from './dto/create-deck.dto';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IRequest } from '../../interfaces';
import { IsLoggedInGuard } from '../../guards/isLoggedIn';

@Controller('decks')
@ApiBearerAuth('jwt')
@ApiTags('flashcards')
export class DecksController {
  constructor(private readonly decksService: DecksService) {}

  @Post()
  @UseGuards(IsLoggedInGuard)
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Deck was created successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Deck failed validation' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Missing or invalid token in Authorization header' })
  async create(@Body() createDeckDto: CreateDeckDto, @Req() req: IRequest): Promise<{ id: number }> {
    const id = req.user?.id || 0;
    
    const deck = await this.decksService.create(createDeckDto, id);
    return { id: deck.id };
  }
}
