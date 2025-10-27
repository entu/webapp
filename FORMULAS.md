# Formulas

This document describes the available formula functions that can be used in entity properties.

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
- `property_name` - Reference a property on the same entity
- `_id` - Reference the entity's ID

### Related Entities
- `property_name.*.property` - Reference a property through a reference field
- `property_name.type.property` - Reference a property through a reference field filtered by entity type
- `property_name.*._id` - Get IDs of referenced entities
- `property_name.type._id` - Get IDs of referenced entities filtered by type

### Child Entities
- `_child.*.property` - Reference properties from all child entities
- `_child.type.property` - Reference properties from child entities of a specific type
- `_child.*._id` - Get IDs of all child entities
- `_child.type._id` - Get IDs of child entities of a specific type

### Referrer Entities (entities that reference this one)
- `_referrer.*.property` - Reference properties from all entities that reference this one
- `_referrer.type.property` - Reference properties from referrer entities of a specific type
- `_referrer.*._id` - Get IDs of all entities that reference this one
- `_referrer.type._id` - Get IDs of referrer entities of a specific type

### Literal Values
- `'text'` or `"text"` - String literal (quoted)
- `123` or `45.67` - Numeric literal

## Functions

### CONCAT (default)
Concatenates all values into a single string.

**Returns:** String

**Example:**
```
first_name last_name CONCAT
```

### CONCAT_WS
Concatenates values with a separator. The last value is used as the separator.

**Returns:** String

**Example:**
```
first_name last_name ' ' CONCAT_WS
```
This joins first_name and last_name with a space between them.

### COUNT
Counts the number of values.

**Returns:** Number

**Example:**
```
items COUNT
```

### SUM
Calculates the sum of all numeric values.

**Returns:** Number

**Example:**
```
price quantity SUM
```

### SUBTRACT
Subtracts all subsequent values from the first value.

**Returns:** Number

**Example:**
```
total discount SUBTRACT
```
Returns: `total - discount`

### MULTIPLY
Multiplies all values together.

**Returns:** Number

**Example:**
```
price quantity MULTIPLY
```

### DIVIDE
Divides the first value by all subsequent values. Returns `undefined` if division by zero is attempted.

**Returns:** Number or undefined

**Example:**
```
total count DIVIDE
```
Returns: `total / count`

### AVERAGE
Calculates the arithmetic mean of all values.

**Returns:** Number

**Example:**
```
score1 score2 score3 AVERAGE
```

### MIN
Returns the minimum value.

**Returns:** Number

**Example:**
```
_child.*.price MIN
```

### MAX
Returns the maximum value.

**Returns:** Number

**Example:**
```
_child.*.price MAX
```

### ABS
Returns the absolute value of the first value.

**Returns:** Number

**Example:**
```
balance ABS
```

## Examples

### Calculate total price
```
price quantity MULTIPLY
```

### Get full name
```
first_name ' ' last_name CONCAT_WS
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

### Calculate difference
```
revenue expenses SUBTRACT
```

### Get absolute value
```
temperature ABS
```
