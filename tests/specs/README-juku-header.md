# Juku Header Test with Environment Variable

This test suite allows you to test different juku (brand) pages by passing a brand ID via environment variable.

## Usage

### Default Brand ID (21 - 個別教室のトライ)
```bash
npx playwright test tests/specs/juku-header.spec.ts
```

### Custom Brand ID via Environment Variable
```bash
# Windows (Command Prompt)
set JUKU_BRAND_ID=5 && npx playwright test tests/specs/juku-header.spec.ts

# Windows (PowerShell)
$env:JUKU_BRAND_ID="5"; npx playwright test tests/specs/juku-header.spec.ts

# macOS/Linux
JUKU_BRAND_ID=5 npx playwright test tests/specs/juku-header.spec.ts
```

### Multiple Brand IDs Examples
```bash
# Test brand ID 1
JUKU_BRAND_ID=1 npx playwright test tests/specs/juku-header.spec.ts

# Test brand ID 10
JUKU_BRAND_ID=10 npx playwright test tests/specs/juku-header.spec.ts

# Test brand ID 100
JUKU_BRAND_ID=100 npx playwright test tests/specs/juku-header.spec.ts
```

### Running Specific Tests
```bash
# Run only the basic information test
JUKU_BRAND_ID=5 npx playwright test tests/specs/juku-header.spec.ts -g "basic information"

# Run with headed mode to see the browser
JUKU_BRAND_ID=5 npx playwright test tests/specs/juku-header.spec.ts --headed
```

## Environment Variable Details

- **Variable Name**: `JUKU_BRAND_ID`
- **Default Value**: `21` (個別教室のトライ)
- **Expected Format**: String containing numeric brand ID

## Test Behavior

When using the default brand ID (21), the tests will:
- Verify specific values like "個別教室のトライ" for the juku name
- Check for specific grade ranges (小学1年生〜高卒生)
- Verify specific lesson formats (完全個別指導（1対1）, オンライン対応あり)

When using a custom brand ID, the tests will:
- Verify that data exists but won't check specific values
- Ensure the page structure is correct
- Validate data types and formats without expecting specific content

## Example Output

```
Testing with Brand ID: 5
Using Brand ID from environment variable
Juku name: [Actual juku name for brand 5]
Rating: 4.2
Review count: 1234
...
```