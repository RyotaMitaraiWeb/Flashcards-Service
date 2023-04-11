import { Controller, Get, Post, Body, Patch, Param, Delete, Headers, Req, UseGuards, HttpStatus, ParseIntPipe, HttpCode, Put } from '@nestjs/common';
import { DecksService } from './decks.service';
import { CreateDeckDto } from './dto/create-deck.dto';
import { ApiBearerAuth, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IRequest } from '../../interfaces';
import { IsLoggedInGuard } from '../../guards/isLoggedIn';
import { Deck } from './entities/deck.entity';
import { GetDeckDto } from './dto/get-deck.dto';
import { IsCreatorGuard } from '../../guards/isCreator';

@Controller('decks')
@ApiBearerAuth('jwt')
@ApiTags('flashcards')
export class DecksController {
  constructor(private readonly decksService: DecksService) { }

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

  @Get(':id')
  @ApiTags('flashcards')
  @ApiResponse({ status: HttpStatus.OK, description: 'Deck retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Deck does not exist or is deleted' })
  @ApiParam({
    name: 'id',
    description: 'The id of the deck',
  })
  async findById(@Param('id', ParseIntPipe) id: number): Promise<GetDeckDto> {
    const deck = await this.decksService.findDeckById(id);
    return deck;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(IsLoggedInGuard, IsCreatorGuard)
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Deck was deleted successfully' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Invalid or missing JWT in Authorization header' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'JWT is valid, but the user\'s id does not match the author\'s' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Deck does not exist or is already marked as deleted' })
  @ApiParam({
    name: 'id',
    description: 'the ID of the deck to be deleted',
  })
  async deleteDeck(@Param('id', ParseIntPipe) id: number) {
    await this.decksService.deleteDeckOrThrow(id);
    return {};
  }
}
