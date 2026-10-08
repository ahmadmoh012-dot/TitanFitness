using System.Linq.Expressions;
using TitanFitness.Domain.Common;

namespace TitanFitness.Domain.Common.Repositories;

public interface IReadRepository<T>
    where T : class, IEntity
{
    Task<T?> GetByIdAsync(
        int id,
        CancellationToken cancellationToken);

    Task<IReadOnlyCollection<T>> GetAsync(
        Expression<Func<T, bool>>? predicate,
        Expression<Func<T, object>>? orderBy,
        bool orderByDescending,
        int? skip,
        int? take,
        CancellationToken cancellationToken);

    Task<bool> AnyAsync(
        Expression<Func<T, bool>> predicate,
        CancellationToken cancellationToken);

    Task<int> CountAsync(
        Expression<Func<T, bool>>? predicate,
        CancellationToken cancellationToken);
}