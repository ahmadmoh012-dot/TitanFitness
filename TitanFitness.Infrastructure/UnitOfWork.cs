using TitanFitness.Domain.Common.Repositories;
using TitanFitness.Infrastructure.Data;

namespace TitanFitness.Infrastructure;

public sealed class UnitOfWork : IUnitOfWork
{
    private readonly TitanFitnessDbContext _dbContext;

    public UnitOfWork(TitanFitnessDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<int> SaveChangesAsync(
        CancellationToken cancellationToken)
    {
        return await _dbContext.SaveChangesAsync(cancellationToken);
    }
}