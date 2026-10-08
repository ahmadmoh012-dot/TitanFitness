using TitanFitness.Domain.Common;

namespace TitanFitness.Domain.Common.Repositories;

public interface IWriteRepository<T>
    where T : class, IAggregateRoot
{
    Task<T?> GetByIdAsync(
        int id,
        CancellationToken cancellationToken);

    void Add(T entity);

    void Update(T entity);

    void Remove(T entity);
}