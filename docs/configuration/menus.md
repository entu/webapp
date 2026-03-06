# Menus

Menus are the navigation items shown in the sidebar. Each menu item links to a filtered list of entities. They are entities of type `menu` — create them in the Configuration area.

When a menu item is active (current page URL matches its query), entity types whose `add_from` references that menu will show an "Add" button in the toolbar.

## Menu Parameters

| Param | Description |
|---|---|
| `name` | Display name shown in the sidebar. |
| `group` | Groups menu items under a named section header. Items with the same `group` value are shown together. |
| `ordinal` | Numeric sort order within the group. Lower numbers appear first. |
| `query` | URL query string that defines what entities this menu shows. When the current page URL starts with this query, the menu item is highlighted as active. |

The `query` parameter uses the standard entity filter syntax. See [API → Query Reference](../api/query-reference.md) for the full syntax.

::: info
The connection between menus and entity types is two-way: the menu defines what to show, and the entity type's `add_from` property references the menu to make the "Add" button appear when that menu is active.
:::

## Example Menu Setup

A typical sidebar for a project management application:

| `name` | `group` | `ordinal` | `query` |
|---|---|---|---|
| Projects | Work | 1 | `_type.string=project&sort=name.string` |
| Tasks | Work | 2 | `_type.string=task&status.string.in=active,pending` |
| Invoices | Finance | 1 | `_type.string=invoice&sort=-date.date` |
| People | Admin | 1 | `_type.string=person&sort=name.string` |

To allow creating entities of that type from a menu, set the entity type's `add_from` to reference the menu entity. When that menu is active, the "Add" button will appear in the toolbar.
