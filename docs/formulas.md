Properties can be computed dynamically using formulas defined in entity type definitions (`formula` field). Formulas enable you to calculate values based on other properties, aggregate data from related entities, and create complex expressions without manual data entry.

## Syntax

Formulas are written as space-separated values followed by an optional function name:

```
field1 field2 field3 FUNCTION
```

If no function is specified, `CONCAT` is used by default.

### Nested Formulas

You can nest formulas using parentheses to create complex calculations:

```
(field1 field2 SUM) (field3 field4 SUM) MULTIPLY
```

This evaluates the inner formulas first, then uses their results in the outer formula. Nesting can be multiple levels deep.

**Examples:**
- `(price tax SUM) quantity MULTIPLY` - Calculate total with tax per quantity
- `((a b SUM) (c d SUM) MULTIPLY) 100 DIVIDE` - Complex nested calculation
- `(min_value max_value SUM) 2 DIVIDE` - Calculate average of min and max

## Field References

### Same Entity

| Reference | Description |
|---|---|
| `property_name` | Reference a property on the same entity |
| `_id` | Reference the entity's own ID |

### Related Entities

| Reference | Description |
|---|---|
| `property_name.*.property` | Traverse reference to access property from related entity |
| `property_name.type.property` | Filter by entity type when traversing references |
| `property_name.*._id` | Get IDs of referenced entities |
| `property_name.type._id` | Get IDs of referenced entities filtered by type |

### Child Entities

| Reference | Description |
|---|---|
| `_child.*.property` | Reference properties from all child entities |
| `_child.type.property` | Reference properties from child entities of a specific type |
| `_child.*._id` | Get IDs of all child entities |
| `_child.type._id` | Get IDs of child entities of a specific type |

### Referrer Entities
Entities that reference this one through reference properties:

| Reference | Description |
|---|---|
| `_referrer.*.property` | Reference properties from all entities that reference this one |
| `_referrer.type.property` | Reference properties from referrer entities of a specific type |
| `_referrer.*._id` | Get IDs of all entities that reference this one |
| `_referrer.type._id` | Get IDs of referrer entities of a specific type |

### Literal Values

| Reference | Description |
|---|---|
| `'text'` or `"text"` | String literal (must be quoted) |
| `123` or `45.67` | Numeric literal |

## Available Functions

### CONCAT (default)
Concatenates all values into a single string.

```
first_name last_name CONCAT
```

### CONCAT_WS
Concatenates values with a separator (last value is the separator).

```
first_name last_name ' ' CONCAT_WS
```

### COUNT
Counts the number of values.

```
_child.*._id COUNT
```

### SUM
Calculates the sum of all numeric values.

```
price tax SUM
```

### SUBTRACT
Subtracts all subsequent values from the first value.

```
revenue expenses SUBTRACT  → revenue - expenses
```

### MULTIPLY
Multiplies all values together.

```
price quantity MULTIPLY
```

### DIVIDE
Divides the first value by all subsequent values. Returns `undefined` if division by zero.

```
total count DIVIDE  → total / count
```

### AVERAGE
Calculates the arithmetic mean of all values.

```
_child.*.price AVERAGE
```

### MIN
Returns the minimum value.

```
_child.*.price MIN
```

### MAX
Returns the maximum value.

```
_child.*.price MAX
```

### ABS
Returns the absolute value of the first value.

```
temperature ABS
```

### ROUND
Rounds the first value to decimal places specified by the last value.

```
price 2 ROUND  → price rounded to 2 decimals
(total quantity DIVIDE) 3 ROUND  → total/quantity rounded to 3 decimals
```

## Examples

### Calculate total price
```
price quantity MULTIPLY
```

### Get full name
```
first_name last_name ' ' CONCAT_WS
```

### Count child entities
```
_child.*._id COUNT
```

### Calculate average of child prices
```
_child.*.price AVERAGE
```

### Get maximum value from related entities
```
related_field.*.amount MAX
```

### Calculate price difference
```
original_price sale_price SUBTRACT
```

### Round then multiply
```
(price 2 ROUND) quantity MULTIPLY
```
