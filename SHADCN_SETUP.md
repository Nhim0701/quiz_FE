# shadcn/ui Setup Guide

This project has been configured to use shadcn/ui components.

## Installation

First, install the required dependencies:

```bash
npm install
```

## Adding Components

To add shadcn/ui components to your project, use the shadcn CLI:

```bash
npx shadcn@latest add [component-name]
```

For example:
```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
```

## Configuration

- **components.json**: Contains shadcn/ui configuration
- **src/lib/utils.ts**: Contains the `cn()` utility function for className merging
- **src/index.css**: Contains CSS variables for theming
- **Path aliases**: `@/*` is configured to point to `./src/*`

## Usage

Import components from `@/components/ui`:

```tsx
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

function MyComponent() {
  return (
    <Card>
      <Button>Click me</Button>
    </Card>
  );
}
```

## Available Utilities

- `cn()`: Merge classNames with tailwind-merge (from `@/lib/utils`)

