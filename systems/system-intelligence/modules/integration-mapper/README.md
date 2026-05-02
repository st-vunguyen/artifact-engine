# integration-mapper (module)

> Extract integration edges (HTTP / queue / db) from sources.

## API

```ts
mapHttpIntegrations(apiSpecs: OpenAPI[], hld: NormalizedCorpus): Integration[]
mapAsyncIntegrations(hld: NormalizedCorpus, lld: NormalizedCorpus): Integration[]
mapDataIntegrations(hld: NormalizedCorpus, lld: NormalizedCorpus): Integration[]
mergeAndDeduplicate(integrations: Integration[]): Integration[]
```

## Heuristics

- HTTP: OpenAPI server URLs + LLD service-call language
- Async: queue mentions (Kafka, RabbitMQ, SQS), event language
- DB: prisma/sqlmodel/SQLAlchemy schemas, "writes to <table>" language

## Output

`Integration[]` per `system-graph-contract.md` §3.

## Used by

- agent: `system-graph-builder`
- skill: `graph-extraction`
