# wp1-cpp-visualization

- Conceptual mockup of CPP relations in EOSC EDEN work package 1.2
- https://cpp.fd-dev.csc.fi (hosted locally w/ simple httpd server)

## Types of relations

### Depenencies

| Main Relationship         | Inverse Relationship      | Type          | Description                                                                                                         |
| :------------------------ | :------------------------ | :------------ | :-------------------------------------------------------------------------------------------------------------------|
| `requires`                | `required_by`             | Bidirectional | Hard dependency - related CPP must have been executed before or during the current CPP - to enable its performance. |
| `may_require`             | `may_be_required_by`      | Bidirectional | Same as the hard dependency, but only applies to certain circumstances (soft dependency)                            |

### Logical relationships

| Main Relationship         | Inverse Relationship      | Type          | Description                                                                                        |
| :------------------------ | :------------------------ | :------------ | :--------------------------------------------------------------------------------------------------|
| `affects`                 | `affected_by`             | Bidirectional | The effect of the current CPP has consequences on the performance of the related CPP.              |
| `facilitates`             | `facilitated_by`          | Bidirectional | Performing the current CPP is not mandatory but may make the completion of the related CPP easier. |
| `affinity_with`           | -                         | Symmetrical   | CPPs may be considered to have some characteristics in common.                                     |
| `not_to_be_confused_with` | -                         | Symmetrical   | CPPs might be confused.                                                                            |

### Procedural relationships

| Main Relationship         | Inverse Relationship      | Type          | Description                                                                                                           |
| :------------------------ | :------------------------ | :------------ | :---------------------------------------------------------------------------------------------------------------------|
| `triggered_by`            | `triggers`                | Bidirectional | The related CPP causes the need to perform current CPP.                                                               |
| `supplier`                | `customer`                | Bidirectional | The current CPP uses as input of one of its steps the product of the related CPP.                                     |
| `customer`                | `supplier`                | Bidirectional | The current CPP provides as output of one of its steps an input for the related CPP.                                  |
| `alternative_to`          | -                         | Symmetrical   | Under certain circumstances, the related CPP may be performed instead of the current CPP.                             |

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
