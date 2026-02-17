# Design Specification

## Components

### Button

Interactive button for user actions

**Props:**
- `size`: [object Object]
- `loading`: [object Object]
- `variant`: [object Object]
- `disabled`: [object Object]
- `leftIcon`: [object Object]
- `fullWidth`: [object Object]
- `rightIcon`: [object Object]

**Variants:** primary, secondary, outline, ghost, destructive, link

### IconButton

Button with only an icon for compact interfaces

**Variants:** primary, secondary, outline, ghost

### Input

Text input field for user data entry

**Props:**
- `size`: [object Object]
- `error`: [object Object]
- `disabled`: [object Object]
- `readonly`: [object Object]
- `leftElement`: [object Object]
- `placeholder`: [object Object]
- `rightElement`: [object Object]

**Variants:** default, filled, flushed, unstyled

### Textarea

Multi-line text input for longer content

**Props:**
- `rows`: [object Object]
- `size`: [object Object]
- `error`: [object Object]
- `resize`: [object Object]
- `disabled`: [object Object]

**Variants:** default, filled, flushed, unstyled

### Select

Dropdown selection input

**Props:**
- `size`: [object Object]
- `disabled`: [object Object]
- `multiple`: [object Object]
- `searchable`: [object Object]
- `placeholder`: [object Object]

**Variants:** default, filled, flushed, unstyled

### Checkbox

Boolean selection input

**Props:**
- `size`: [object Object]
- `checked`: [object Object]
- `disabled`: [object Object]
- `indeterminate`: [object Object]

**Variants:** default, solid

### Radio

Single selection from multiple options

**Props:**
- `name`: [object Object]
- `size`: [object Object]
- `checked`: [object Object]
- `disabled`: [object Object]

**Variants:** default, solid

### Switch

Toggle switch for boolean settings

**Props:**
- `size`: [object Object]
- `checked`: [object Object]
- `disabled`: [object Object]

**Variants:** default, solid

### Card

Container for related content

**Props:**
- `size`: [object Object]
- `variant`: [object Object]
- `clickable`: [object Object]
- `hoverable`: [object Object]

**Variants:** elevated, outline, filled, unstyled

### Modal

Overlay dialog for important interactions

**Props:**
- `size`: [object Object]
- `centered`: [object Object]
- `closeOnEsc`: [object Object]
- `closeOnOverlayClick`: [object Object]

**Variants:** default, centered

### Alert

Status messages and notifications

**Props:**
- `icon`: [object Object]
- `size`: [object Object]
- `title`: [object Object]
- `variant`: [object Object]
- `dismissible`: [object Object]

**Variants:** success, warning, error, info

### Badge

Small status indicators and labels

**Props:**
- `size`: [object Object]
- `variant`: [object Object]
- `colorScheme`: [object Object]

**Variants:** solid, subtle, outline

### Avatar

User profile picture or initials display

**Props:**
- `alt`: [object Object]
- `src`: [object Object]
- `name`: [object Object]
- `size`: [object Object]
- `shape`: [object Object]

**Variants:** circular, rounded, square

### Spinner

Loading indicator

**Props:**
- `size`: [object Object]
- `color`: [object Object]
- `speed`: [object Object]

**Variants:** solid, outline

### Progress

Progress indicator for tasks

**Props:**
- `size`: [object Object]
- `value`: [object Object]
- `variant`: [object Object]
- `colorScheme`: [object Object]
- `isIndeterminate`: [object Object]

**Variants:** linear, circular

### Table

Data display in tabular format

**Props:**
- `size`: [object Object]
- `caption`: [object Object]
- `variant`: [object Object]

**Variants:** simple, striped, bordered

### Tabs

Navigation between related content panels

**Props:**
- `size`: [object Object]
- `isLazy`: [object Object]
- `variant`: [object Object]
- `orientation`: [object Object]
- `defaultIndex`: [object Object]

**Variants:** line, enclosed, soft-rounded, solid-rounded

### Accordion

Collapsible content sections

**Props:**
- `size`: [object Object]
- `variant`: [object Object]
- `allowToggle`: [object Object]
- `defaultIndex`: [object Object]
- `allowMultiple`: [object Object]

**Variants:** default, filled, separated

### Breadcrumb

Navigation hierarchy indicator

**Props:**
- `size`: [object Object]
- `spacing`: [object Object]
- `separator`: [object Object]

**Variants:** default, enclosed

### Pagination

Navigation for paginated content

**Props:**
- `size`: [object Object]
- `total`: [object Object]
- `current`: [object Object]
- `variant`: [object Object]
- `showLast`: [object Object]
- `siblings`: [object Object]
- `showFirst`: [object Object]

**Variants:** default, outlined, minimal

### Toast

Temporary notification messages

**Props:**
- `title`: [object Object]
- `variant`: [object Object]
- `duration`: [object Object]
- `position`: [object Object]
- `isClosable`: [object Object]
- `description`: [object Object]

**Variants:** success, warning, error, info

### Tooltip

Contextual information on hover

**Props:**
- `delay`: [object Object]
- `label`: [object Object]
- `hasArrow`: [object Object]
- `placement`: [object Object]
- `closeDelay`: [object Object]

**Variants:** default, arrow

### Popover

Rich content overlay triggered by user action

**Props:**
- `trigger`: [object Object]
- `hasArrow`: [object Object]
- `placement`: [object Object]
- `closeOnEsc`: [object Object]
- `closeOnBlur`: [object Object]

**Variants:** default, arrow

### Drawer

Slide-out panel for additional content or navigation

**Props:**
- `size`: [object Object]
- `placement`: [object Object]
- `closeOnEsc`: [object Object]
- `closeOnOverlayClick`: [object Object]

**Variants:** default, push

### Skeleton

Loading placeholder that mimics content structure

**Props:**
- `count`: [object Object]
- `width`: [object Object]
- `height`: [object Object]
- `variant`: [object Object]
- `animation`: [object Object]

**Variants:** text, rectangle, circle

