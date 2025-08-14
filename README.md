# wp1-cpp-visualization

- Conceptual mockup of CPP relations in EOSC EDEN work package 1.2
- https://cpp.fd-dev.csc.fi (hosted locally w/ simple httpd server)

## Types of relations

```bash
⚡ triggered_by
📦 supplier
📞 customer
🔗 dependency
🤝 affinity_with
📋 is_required_by
📑 may_be_required_by
💭 not_to_be_confused_with
🏣 facilitated_by
➡️ enables
🍂 is_fallback_for
💨 affected_by
```

## Running locally

```bash
# How to run
python -m http.server 8000
```

## Utilities

```bash
# Cleanup
npx prettier --write .

# Tree file structure output
tree > tree.txt
```
