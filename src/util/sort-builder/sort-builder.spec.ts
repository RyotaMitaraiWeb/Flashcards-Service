import { validationRules } from '../../constants/validationRules';
import { ISorter, order, sortCategory } from '../../interfaces';
import { sortBuilder } from './sort-builder';


describe('sortBuilder', () => {
  it('Returns an object that has the same values as the input if they are valid (page is passed as a string)', () => {
    const sortBy: sortCategory = validationRules.deck.search.sortBy[0];
    const order: order = validationRules.deck.search.order[0];
    const page = '1';

    const sort = sortBuilder(sortBy, order, page);
    expect(sort).toEqual<ISorter>({
      sortBy,
      order,
      page: Number(page),
    });
  });

  it('Returns an object that has the same values as the input if they are valid (page is passed as a number)', () => {
    const sortBy: sortCategory = validationRules.deck.search.sortBy[0];
    const order: order = validationRules.deck.search.order[0];
    const page = 1;

    const sort = sortBuilder(sortBy, order, page);
    expect(sort).toEqual<ISorter>({
      sortBy,
      order,
      page,
    });
  });

  it('Returns an object with default values for each invalid input', () => {
    const sortBy = 'a';
    const order = 'a';
    
    const sort = sortBuilder(sortBy, order);
    expect(sort).toEqual<ISorter>({
      sortBy: validationRules.deck.search.sortBy[0],
      order: validationRules.deck.search.order[0],
      page: 1,
    });
  });

  it('Returns page 1 if passed a negative page', () => {
    const page = -1;

    const sort = sortBuilder(undefined, undefined, page);
    expect(sort.page).toEqual(1);
  });
});