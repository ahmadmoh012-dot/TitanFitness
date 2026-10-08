using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using TitanFitness.Domain.Common.Repositories;
using TitanFitness.Infrastructure.Data;
using TitanFitness.Infrastructure.Repositories;

namespace TitanFitness.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration
            .GetConnectionString("TitanFitnessConnection")
            ?? throw new InvalidOperationException(
                "TitanFitness connection string was not found.");

        services.AddDbContext<TitanFitnessDbContext>(options =>
            options.UseSqlServer(connectionString));

        services.AddScoped(
            typeof(IReadRepository<>),
            typeof(ReadRepository<>));

        services.AddScoped(
            typeof(IWriteRepository<>),
            typeof(WriteRepository<>));

        services.AddScoped<IUnitOfWork, UnitOfWork>();

        return services;
    }
}