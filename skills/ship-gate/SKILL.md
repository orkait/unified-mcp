---
name: ship-gate
description: Use before claiming any work is complete, fixed, or passing. Run the verification command and show output before making any success claim.
---

# Verification Before Completion

## The Iron Law

```
NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE.
```

If you have not run the verification command in this message, you cannot claim it passes.

Claiming completion without evidence is not efficiency. It is dishonesty.

**Violating the letter of this rule is violating the spirit of this rule.**

## The Gate

Before claiming any status or expressing satisfaction:

```
1. IDENTIFY  — What command proves this claim?
2. RUN       — Execute it fresh. Not from memory. Not from a prior run in this session.
3. READ      — Full output. Exit code. Error count. Every line.
4. VERIFY    — Does output confirm the claim?
               NO  → State actual status with evidence
               YES → State claim WITH evidence attached
5. CLAIM     — Only now.
```

Skipping any step = lying, not verifying.

## Verification Map

| Claim | What is required | What is not sufficient |
|---|---|---|
| Tests pass | Test command output showing 0 failures | "Should pass", previous run, looking at the code |
| Build succeeds | Build command: exit 0 | Linter passing, "no obvious errors" |
| Bug is fixed | Reproduce original symptom: now passes | Code changed, "logically fixed" |
| Type checks | `tsc --noEmit`: 0 errors | "Looks typed correctly" |
| MCP data applied correctly | Code matches MCP output shown in session | "I followed the pattern" |
| Requirements met | Line-by-line checklist against the spec | Tests passing |
| Subagent completed | VCS diff confirms actual changes | Subagent reports "done" |
| Regression covered | Red-green cycle verified (test fails without fix, passes with it) | "I wrote a test for it" |

## Red Flags — STOP

| Thought | Reality |
|---|---|
| "Should work now" | Run the command |
| "I'm confident in this change" | Confidence is not evidence |
| "Subagent said it's done" | Check the VCS diff |
| "Minor change, no need to recheck" | Minor changes cause regressions |
| "Tests were passing before my change" | Run them again |
| "MCP tool confirmed the pattern" | That confirms the pattern — not that your code is correct |
| "I'll verify after I push" | Verify before you push |
| Using "should", "probably", "appears to" | Run the command |
| "Just this once" | No exceptions |

## Integration

Run this skill before:
- Any `git commit` or PR creation
- Marking any task as complete in TodoWrite
- Reporting status to the user
- Claiming a bug is fixed
- Handing work off to a subagent or reviewer
- Transitioning between phases in `hyperstack:engineering-discipline`
