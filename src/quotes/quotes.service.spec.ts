import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { QuoteStatus } from './quote-status.enum';
import { Quote } from './quotes.entity';
import { QuotesService } from './quotes.service';
import { type User } from './users.entity';

const USER = { id: 'user-1', organizationId: 'org-1' } as User;

/** The seeded control quote: the worked example from the brief, at $297.00. */
const controlQuote = () =>
  ({
    id: 'quote-1',
    organizationId: 'org-1',
    customerName: 'Control Case',
    status: QuoteStatus.Draft,
    discountType: null,
    discountValue: 0,
    taxRate: 800,
    sections: [
      {
        id: 'section-1',
        name: 'Control Section',
        markup: 10,
        items: [
          { id: 'item-1', description: 'Line A', quantity: 2, price: 10000 },
          { id: 'item-2', description: 'Line B', quantity: 1, price: 5000 },
        ],
      },
    ],
  }) as unknown as Quote;

describe('QuotesService', () => {
  let service: QuotesService;
  let quotes: { find: jest.Mock; findOne: jest.Mock };

  beforeEach(async () => {
    quotes = { find: jest.fn(), findOne: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuotesService,
        { provide: getRepositoryToken(Quote), useValue: quotes },
      ],
    }).compile();

    service = module.get<QuotesService>(QuotesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('returns a quote with its totals worked out', async () => {
    quotes.findOne.mockResolvedValue(controlQuote());

    const quote = await service.getQuoteForTenant(USER, 'quote-1');

    expect(quote.totals.subtotal).toBe(27500);
    expect(quote.totals.tax).toBe(2200);
    expect(quote.totals.total).toBe(29700);
  });

  it('only looks for quotes in the user own organization', async () => {
    quotes.findOne.mockResolvedValue(controlQuote());

    await service.getQuoteForTenant(USER, 'quote-1');

    expect(quotes.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { organizationId: 'org-1', id: 'quote-1' },
      }),
    );
  });

  it('reports a quote outside the organization as missing', async () => {
    quotes.findOne.mockResolvedValue(null);

    await expect(service.getQuoteForTenant(USER, 'quote-1')).rejects.toThrow(
      NotFoundException,
    );
  });
});
