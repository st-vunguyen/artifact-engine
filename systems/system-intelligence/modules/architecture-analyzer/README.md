# architecture-analyzer (module)

> Detect architectural patterns from the system graph.

## Purpose

Recognize patterns (event-driven, microservices, monolith, hub-and-spoke, layered) and surface implications for testing.

## API

```ts
analyzePatterns(graph: SystemGraph): ArchitecturePattern[]
implicationsFor(pattern: ArchitecturePattern): TestingImplication[]
```

## Patterns detected

- Event-driven (queues, async events dominate)
- Microservices (many small services with isolated responsibilities)
- Monolith (one big component)
- Hub-and-spoke (one central component connected to many)
- Layered (UI → API → Service → DB chain)

## Implications

For each pattern, output testing-relevant implications:
- Event-driven → integration testing must cover dead-letter / retry
- Microservices → contract testing per pair
- Hub-and-spoke → high blast-radius for hub changes (regression-intelligence weight)

## Output

Annotation in `system-graph.json.metadata.architecture` field.
