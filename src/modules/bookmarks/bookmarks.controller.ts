import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpStatus, Req, HttpCode, Query } from '@nestjs/common';
import { BookmarksService } from './bookmarks.service';
import { BookmarkDto } from './dto/bookmark.dto';
import { IsLoggedInGuard } from '../../guards/isLoggedIn/isLoggedIn';
import { ApiBearerAuth, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IsNotCreatorGuard } from '../../guards/isNotCreator/isNotCreator';
import { IRequest } from '../../interfaces';
import { AllDecksDto } from '../decks/dto/all-decks-dto';
import { DeckListDto } from '../decks/dto/deck-list-dto';
import { sortBuilder } from '../../util/sort-builder/sort-builder';
import { validationRules } from '../../constants/validationRules';

@ApiTags('bookmarks')
@ApiBearerAuth('jwt')
@Controller('bookmarks')
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) { }

  @UseGuards(IsLoggedInGuard, IsNotCreatorGuard)
  @Post(':id')
  @ApiParam({
    description: 'The ID of the deck to be bookmarked',
    name: 'id',
  })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Deck was bookmarked successfully' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Invalid or missing JWT in Authorization header' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Deck is already bookmarked or the user is the creator of the deck' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Deck does not exist or is marked as deleted' })
  async addBookmark(@Req() req: IRequest) {
    const { user, params } = req;
    const userId = user.id;
    const deckId = Number(params['id']);

    await this.bookmarksService.addBookmarkOrThrow(userId, deckId);

    return {};
  }

  @UseGuards(IsLoggedInGuard, IsNotCreatorGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({
    description: 'The ID of the deck whose bookmark to be removed',
    name: 'id',
  })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Bookmark removed successfully' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Invalid or missing JWT in Authorization header' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Deck is not bookmarked on first place or the user is the creator of the deck' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Deck does not exist or is marked as deleted' })
  async removeBookmark(@Req() req: IRequest) {
    const { user, params } = req;
    const userId = user.id;
    const deckId = Number(params['id']);

    await this.bookmarksService.removeBookmarkOrThrow(userId, deckId);
    return {};
  }

  @Get()
  @UseGuards(IsLoggedInGuard)
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
  @ApiResponse({ status: HttpStatus.OK, description: 'Request is valid' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Invalid or missing JWT in Authorization header' })
  async getSavedDecks(
    @Req() req: IRequest,
    @Query('sortBy') sortBy: string,
    @Query('order') order: string,
    @Query('page') page: string | number
  ): Promise<DeckListDto> {
    const userId = Number(req?.user.id) || 0;

    const sort = sortBuilder(sortBy, order, page);
    const decks = await this.bookmarksService.findUserBookmarks(userId, sort);

    return decks;
  }
}
