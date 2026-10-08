using TitanFitness.Domain.Common;

namespace TitanFitness.Domain.Branches;

public sealed class Branch : IAggregateRoot

{
        private readonly List<Studio> _studios = [];

        public int Id { get; private set; }
        public string Name { get; private set; } = null!;
        public string? Address { get; private set; }
        public TimeOnly OpeningTime { get; private set; }
        public TimeOnly ClosingTime { get; private set; }
        public IReadOnlyCollection<Studio> Studios => _studios.AsReadOnly();

        private Branch()
        {
        }

        public Branch(string name, string? address, TimeOnly openingTime, TimeOnly closingTime)
        {
            Name = name;
            Address = address;
            OpeningTime = openingTime;
            ClosingTime = closingTime;
        }

        public void AddStudio(string name, int capacity)
        {
            _studios.Add(new Studio(name, capacity));
        }
    }

