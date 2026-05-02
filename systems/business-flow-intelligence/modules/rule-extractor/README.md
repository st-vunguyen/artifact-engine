# rule-extractor (module)

> Extract atomic business rules from the corpus.

## Purpose

Find imperative constraints ("must", "shall", "should"), categorize them, and produce structured `BusinessRule[]`.

## API

```ts
extractRules(corpus: NormalizedCorpus): BusinessRule[]
classifyRule(text: string): "validation" | "calculation" | "permission" | "lifecycle" | "compliance" | "integration"
splitCompoundRule(text: string): string[]    // breaks "A and B must X" into ["A must X", "B must X"]
```

## Heuristics

- Modal verbs trigger candidates: must / shall / should / required / may not
- Compound subjects split via conjunction parsing
- Categorization from verb patterns (validate / calculate / authorize / transition / report / call)

## Output

```ts
type BusinessRule = {
  rule_id: string
  category: string
  statement: string                 // imperative, atomic
  applies_when: string
  exceptions?: string[]
  evidence: Evidence[]
}
```

## Used by

- agent: `business-rule-extractor`
- skill: `analysis-extraction`
