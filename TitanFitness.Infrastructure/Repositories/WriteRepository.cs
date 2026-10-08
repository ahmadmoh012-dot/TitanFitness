using Microsoft.EntityFrameworkCore;
using TitanFitness.Domain.Common;
using TitanFitness.Domain.Common.Repositories;
using TitanFitness.Infrastructure.Data;

namespace TitanFitness.Infrastructure.Repositories;

public sealed class WriteRepository<T> : IWriteRepository<T>
    where T : class, IAggregateRoot
{
    private readonly TitanFitnessDbContext _dbContext;

    public WriteRepository(TitanFitnessDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<T?> GetByIdAsync(
        int id,
        CancellationToken cancellationToken)
    {
        return await _dbContext.Set<T>()
            .FirstOrDefaultAsync(
                x => EF.Property<int>(x, "Id") == id,
                cancellationToken);
    }

    public void Add(T entity)
    {
        _dbContext.Set<T>().Add(entity);
    }

    public void Update(T entity)
    {
        _dbContext.Set<T>().Update(entity);
    }

    public void Remove(T entity)
    {
        _dbContext.Set<T>().Remove(entity);
    }
}