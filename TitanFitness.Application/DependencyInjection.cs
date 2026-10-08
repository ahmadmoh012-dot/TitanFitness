using FluentValidation;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using TitanFitness.Application.Behaviors;
using TitanFitness.Domain.CheckIns;
using TitanFitness.Domain.Scheduling;

namespace TitanFitness.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(
        this IServiceCollection services)
    {
        services.AddMediatR(typeof(DependencyInjection).Assembly);

        services.AddValidatorsFromAssembly(
            typeof(DependencyInjection).Assembly);

        services.AddTransient(
            typeof(IPipelineBehavior<,>),
            typeof(ValidationBehavior<,>));

        services.AddScoped<EntryEligibilityChecker>();
        services.AddScoped<ClassSessionScheduler>();
        services.AddScoped<ClassBookingService>();

        return services;
    }
}