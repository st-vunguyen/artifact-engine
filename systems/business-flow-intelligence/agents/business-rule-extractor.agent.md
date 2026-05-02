---
agent_id: business-rule-extractor
system: business-flow-intelligence
version: 1.0
declared_inputs: ["runtime/.../01-input/normalized/*.md"]
declared_outputs: ["runtime/.../02-analysis/business-rules.json"]
declared_skills: [analysis-extraction]
declared_mcp: [traceability-mcp, business-flow-mcp]
---

# Business Rule Extractor (Sub-agent)

> Extract atomic business rules from the corpus. Used as a subroutine by the business-flow-generator and by test-strategy-intelligence.

## Output schema

```ts
type BusinessRule = {
  rule_id: string                  // "BR01"
  category: "validation" | "calculation" | "permission" | "lifecycle" | "compliance" | "integration"
  statement: string                // imperative ("Order total must equal sum of line item subtotals")
  applies_when: string             // condition under which this rule applies
  exceptions?: string[]
  evidence: Evidence[]
}
```

## Process

1. Scan corpus for rule indicators ("must", "shall", "should", "is required", "may not").
2. For each candidate:
   - Reduce to one atomic statement.
   - Classify category.
   - Extract `applies_when`.
   - Collect exceptions if mentioned.
   - Cite source.
3. Deduplicate.
4. Write `business-rules.json`.

## Hard rules

- One rule per atomic constraint.
- Imperative voice ("Order total must equal …", not "Order totals are equal to …").
- Cite verbatim.
- No invented constraints.
