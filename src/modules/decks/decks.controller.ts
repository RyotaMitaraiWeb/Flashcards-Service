import { Controller, Get, Post, Body, Patch, Param, Delete, Headers, Req, UseGuards, HttpStatus, ParseIntPipe, HttpCode, Put, Query } from '@nestjs/common';
import { DecksService } from './decks.service';
import { CreateDeckDto } from './dto/create-deck.dto';
import { ApiBearerAuth, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IRequest } from '../../interfaces';
import { IsLoggedInGuard } from '../../guards/isLoggedIn/isLoggedIn';
import { GetDeckDto } from './dto/get-deck.dto';
import { IsCreatorGuard } from '../../guards/isCreator/isCreator';
import { EditDeckDto } from './dto/edit-deck.dto';
import { BookmarksService } from '../bookmarks/bookmarks.service';
import { validationRules } from '../../constants/validationRules';
import { AllDecksDto } from './dto/all-decks-dto';
import { sortBuilder } from '../../util/sort-builder/sort-builder';

@Controller('decks')
@ApiBearerAuth('jwt')
@ApiTags('flashcards')
export class DecksController {
  constructor(
    private readonly decksService: DecksService,
    private readonly bookmarksService: BookmarksService,
  ) { }

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

  @ApiQuery({
    name: 'sortBy',
    description: `The category by which the decks to be sorted. Default is ${validationRules.deck.search.sortBy[0]}`,
    enumName: 'sort categories',
    enum: validationRules.deck.search.sortBy,
    required: false,
  })
  @ApiQuery({
    name: 'order',
    description: `Ascending or descending. Default is ${validationRules.deck.search.order[0]}.`,
    enumName: 'order',
    enum: validationRules.deck.search.order,
    required: false,
  })
  @ApiQuery({
    name: 'page',
    description: `Must be a numeric value. If value is non-numeric, 0, or negative, defaults to 1. Decks per page: ${validationRules.deck.search.limit}`,
    required: false,
  })
  @Get('search')
  async searchDecksByTitle(
    @Query('sortBy') sortBy: string,
    @Query('order') order: string,
    @Query('page') page: string | number,
    @Query('title') title: string): Promise<AllDecksDto[]> {

    const sort = sortBuilder(sortBy, order, page);
    const decks = await this.decksService.searchDecksByTitle(title, sort);

    return decks;
  }

  @Get('all')
  @ApiQuery({
    name: 'sortBy',
    description: `The category by which the decks to be sorted. Default is ${validationRules.deck.search.sortBy[0]}`,
    enumName: 'sort categories',
    enum: validationRules.deck.search.sortBy,
    required: false,
  })
  @ApiQuery({
    name: 'order',
    description: `Ascending or descending. Default is ${validationRules.deck.search.order[0]}.`,
    enumName: 'order',
    enum: validationRules.deck.search.order,
    required: false,
  })
  @ApiQuery({
    name: 'page',
    description: `Must be a numeric value. If value is non-numeric, 0, or negative, defaults to 1. Decks per page: ${validationRules.deck.search.limit}`,
    required: false,
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'By default, you should always get an array' })
  async getAllDecks(
    @Query('sortBy') sortBy: string,
    @Query('order') order: string,
    @Query('page') page: string | number,
  ) {

    const sort = sortBuilder(sortBy, order, page);
    return await this.decksService.getAllDecks(sort);
  }

  @Get('own')
  @UseGuards(IsLoggedInGuard)
  @ApiResponse({ status: HttpStatus.OK, description: 'The request is valid' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Missing or invalid JWT in the Authorization header' })
  @ApiQuery({
    name: 'sortBy',
    description: `The category by which the decks to be sorted. Default is ${validationRules.deck.search.sortBy[0]}`,
    enumName: 'sort categories',
    enum: validationRules.deck.search.sortBy,
    required: false,
  })
  @ApiQuery({
    name: 'order',
    description: `Ascending or descending. Default is ${validationRules.deck.search.order[0]}.`,
    enumName: 'order',
    enum: validationRules.deck.search.order,
    required: false,
  })
  @ApiQuery({
    name: 'page',
    description: `Must be a numeric value. If value is non-numeric, 0, or negative, defaults to 1. Decks per page: ${validationRules.deck.search.limit}`,
    required: false,
  })
  async getUserDecks(
    @Req() req: IRequest,
    @Query('sortBy') sortBy: string,
    @Query('order') order: string,
    @Query('page') page: string | number
  ) {
    const id: number = req?.user?.id || 0;
    const sort = sortBuilder(sortBy, order, page);
    const decks = await this.decksService.getUserDecks(id, sort);

    return decks;
  }

  @Get(':id')
  @ApiResponse({ status: HttpStatus.OK, description: 'Deck retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Deck does not exist or is deleted' })
  @ApiParam({
    name: 'id',
    description: 'The id of the deck',
  })
  async findById(@Param('id', ParseIntPipe) id: number, @Req() req: IRequest): Promise<GetDeckDto> {
    const deck = await this.decksService.findDeckById(id);
    const userId = req.user?.id || 0;

    const bookmarked = await this.bookmarksService.checkIfUserHasBookmarkedDeck(userId, deck.id);
    deck.bookmarked = bookmarked;
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

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(IsLoggedInGuard, IsCreatorGuard)
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Deck was edited successfully' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Invalid or missing JWT in Authorization header' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'JWT is valid, but the user\'s id does not match the author\'s' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Deck does not exist or is already marked as deleted' })
  @ApiParam({
    name: 'id',
    description: 'id of the deck to be deleted',
  })
  async editDeck(@Param('id', ParseIntPipe) id: number, @Body() editDeckDto: EditDeckDto): Promise<{}> {
    await this.decksService.updateDeck(id, editDeckDto);
    return {};
  }
}
