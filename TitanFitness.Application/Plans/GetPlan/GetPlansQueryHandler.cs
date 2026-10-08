using MediatR;
using TitanFitness.Domain.Common.Repositories;
using TitanFitness.Domain.Plans;

namespace TitanFitness.Application.Plans.GetPlans;

public sealed class GetPlansQueryHandler
    : IRequestHandler<GetPlansQuery, GetPlansResponse>
{
    private const int PageSize = 4;

    private readonly IReadRepository<Plan> _planReadRepository;

    public GetPlansQueryHandler(
        IReadRepository<Plan> planReadRepository)
    {
        _planReadRepository = planReadRepository;
    }

    public async Task<GetPlansResponse> Handle(
        GetPlansQuery request,
        CancellationToken cancellationToken)
    {
        var search =
            request.Search?.Trim();

        var plans =
            await _planReadRepository.GetAsync(
                x =>
                    !request.Published.HasValue ||
                    x.IsPublished ==
                    request.Published.Value,
                x => x.Name,
                false,
                null,
                null,
                cancellationToken);

        var items =
            plans
                .Select(plan =>
                    new PlanListItemResponse(
                        plan.Id,
                        plan.Name,
                        plan.Price,
                        plan.DurationInMonths,
                        plan.MaximumFreezeDays,
                        plan.MaximumNumberOfFreezes,
                        plan.GuestPassQuota,
                        plan.AccessScope,
                        plan.IsPublished))
                .ToList();

        if (
            !string.IsNullOrWhiteSpace(search)
        )
        {
            items =
                items
                    .Where(plan =>
                    {
                        var accessScope =
                            plan.AccessScope ==
                            AccessScope.AllBranches
                                ? "All branches"
                                : "Home branch only";

                        var status =
                            plan.IsPublished
                                ? "Published"
                                : "Retired";

                        var freezeAllowance =
                            plan.MaximumFreezeDays == 0 &&
                            plan.MaximumNumberOfFreezes == 0
                                ? "None"
                                : $"{plan.MaximumFreezeDays} days {plan.MaximumNumberOfFreezes} freezes";

                        return
                            plan.Name.Contains(
                                search,
                                StringComparison.OrdinalIgnoreCase)
                            ||
                            plan.Price
                                .ToString("0.00")
                                .Contains(
                                    search,
                                    StringComparison.OrdinalIgnoreCase)
                            ||
                            plan.DurationInMonths
                                .ToString()
                                .Contains(
                                    search,
                                    StringComparison.OrdinalIgnoreCase)
                            ||
                            plan.MaximumFreezeDays
                                .ToString()
                                .Contains(
                                    search,
                                    StringComparison.OrdinalIgnoreCase)
                            ||
                            plan.MaximumNumberOfFreezes
                                .ToString()
                                .Contains(
                                    search,
                                    StringComparison.OrdinalIgnoreCase)
                            ||
                            plan.GuestPassQuota
                                .ToString()
                                .Contains(
                                    search,
                                    StringComparison.OrdinalIgnoreCase)
                            ||
                            accessScope.Contains(
                                search,
                                StringComparison.OrdinalIgnoreCase)
                            ||
                            status.Contains(
                                search,
                                StringComparison.OrdinalIgnoreCase)
                            ||
                            freezeAllowance.Contains(
                                search,
                                StringComparison.OrdinalIgnoreCase);
                    })
                    .ToList();
        }

        var totalCount =
            items.Count;

        var pagedItems =
            items
                .OrderBy(plan => plan.Name)
                .Skip(
                    (request.Page - 1) *
                    PageSize)
                .Take(PageSize)
                .ToList();

        return new GetPlansResponse(
            pagedItems,
            request.Page,
            totalCount);
    }
}