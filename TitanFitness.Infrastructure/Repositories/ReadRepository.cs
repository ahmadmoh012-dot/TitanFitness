using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;
using TitanFitness.Domain.Common;
using TitanFitness.Domain.Common.Repositories;
using TitanFitness.Infrastructure.Data;

namespace TitanFitness.Infrastructure.Repositories;

public sealed class ReadRepository<T> : IReadRepository<T>
    where T : class, IEntity
{
    private readonly TitanFitnessDbContext _dbContext;

    public ReadRepository(TitanFitnessDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<T?> GetByIdAsync(
        int id,
        CancellationToken cancellationToken)
    {
        return await _dbContext.Set<T>()
            .AsNoTracking()
            .FirstOrDefaultAsync(
                x => EF.Property<int>(x, "Id") == id,
                cancellationToken);
    }

    public async Task<IReadOnlyCollection<T>> GetAsync(
        Expression<Func<T, bool>>? predicate,
        Expression<Func<T, object>>? orderBy,
        bool orderByDescending,
        int? skip,
        int? take,
        CancellationToken cancellationToken)
    {
        IQueryable<T> query = _dbContext.Set<T>()
            .AsNoTracking();

        if (predicate is not null)
            query = query.Where(predicate);

        if (orderBy is not null)
            query = orderByDescending
                ? query.OrderByDescending(orderBy)
                : query.OrderBy(orderBy);

        if (skip.HasValue)
            query = query.Skip(skip.Value);

        if (take.HasValue)
            query = query.Take(take.Value);

        return await query.ToListAsync(cancellationToken);
    }

    public async Task<bool> AnyAsync(
        Expression<Func<T, bool>> predicate,
        CancellationToken cancellationToken)
    {
        return await _dbContext.Set<T>()
            .AsNoTracking()
            .AnyAsync(predicate, cancellationToken);
    }

    public async Task<int> CountAsync(
        Expression<Func<T, bool>>? predicate,
        CancellationToken cancellationToken)
    {
        var query = _dbContext.Set<T>()
            .AsNoTracking();

        if (predicate is not null)
            query = query.Where(predicate);

        return await query.CountAsync(cancellationToken);
    }
}