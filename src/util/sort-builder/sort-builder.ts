import { validationRules } from '../../constants/validationRules';
import { ISorter, sortCategory, order } from '../../interfaces';

/**
   * Creates a sort object that will always have valid properties (even if some of the parameters
   * are ``undefined``).
   * @param sortBy 
   * @param order 
   * @param page if negative, zero, or not a numeric value, it will default to ``1``
   * @returns 
   */
export function sortBuilder(sortBy?: string, order?: string, page?: number | string): ISorter {
  page = Number(page) || 1;
  if (page < 0) {
    page = 1;
  }

  if (!validationRules.deck.search.sortBy.includes(sortBy as sortCategory)) {
    sortBy = validationRules.deck.search.sortBy[0];
  }
  
  if (!validationRules.deck.search.order.includes(order as order)) {
    order = validationRules.deck.search.order[0];
  }
  return {
    page,
    sortBy: sortBy as sortCategory,
    order: order as order,
  }
}