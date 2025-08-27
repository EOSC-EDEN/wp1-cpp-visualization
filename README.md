# wp1-cpp-visualization

- Conceptual mockup of CPP relations in EOSC EDEN work package 1.2
- https://cpp.fd-dev.csc.fi (hosted locally w/ simple httpd server)

## Types of relations

```bash
Dependency Relationships (bidirectional):

    Requires / Required by: This represents a hard dependency where one component (CPP) must have been executed for the other to perform
    May require / May be required by: This is a conditional or optional dependency that only applies in certain circumstances

Logical Relationships (bidirectional):

    Affects / Affected by: This describes a relationship where the execution of one component has consequences for the performance of another
    Facilitates / Facilitated by: In this relationship, one component, though not mandatory, makes the completion of another easier

Logical Relationships (symmetrical):
    Affinity with: This is a softer relationship that highlights common characteristics between two components
    Not to be confused with: This relationship is used to explicitly point out the differences between two components that might be easily confused

Procedural Relationships (birdirectional):

    Triggered by / Triggers: This indicates a causal relationship where one component initiates the need to perform another
    Supplier / Customer: This defines a relationship where one component provides the input for another

Procedural Relationships (symmetrical):
    Alternative to: This signifies that under specific conditions, one component can be performed instead of another
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
