# Execution Philosophy (Vision)

> The mindset that drives every line of design.

## The Five Pillars

```
1.  EVIDENCE-DRIVEN     ─ no claim without a source
2.  PHASE-GATED         ─ no Phase N+1 until Phase N is verified
3.  ARTIFACT-NATIVE     ─ communication through typed artifacts, not chatter
4.  RECOVERABLE         ─ every step writes a checkpoint
5.  VERIFICATION-DEEP   ─ surface-level "looks plausible" is not done
```

Violating any pillar = broken, not "fast."

## The default stance

When in doubt, prefer:
- **Less output, more confidence** over more output, less confidence
- **Surfacing a gap** over filling it with plausible content
- **Stopping at a failed gate** over forcing through with caveats
- **Asking for missing evidence** over inferring it
- **Writing a checkpoint** over holding state in memory

AI workflows fail by being too eager, never by being too disciplined.

## See also

- [architecture/execution-philosophy.md](../../architecture/execution-philosophy.md) (full design)
- [validation-philosophy.md](validation-philosophy.md)
- [orchestration-principles.md](orchestration-principles.md)
- [artifact-driven-intelligence.md](artifact-driven-intelligence.md)
