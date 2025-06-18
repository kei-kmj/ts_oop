# Educational Institution Search E2E Testing

This project contains end-to-end test automation for an educational institution search platform using Playwright and TypeScript.

## Project Structure

```
tests/
├── config/
│   └── environment.ts     # Environment configuration
├── pages/                 # Page Object Model files
│   ├── Base.ts           # Base page class
│   ├── Top.ts            # Top page
│   ├── PrefectureSelectPage.ts
│   ├── CitySelectPage.ts
│   ├── GradeSelectPage.ts
│   └── SearchResultsHeaderSection.ts
└── specs/                 # Test specification files
    └── end-to-end-search-scenario.spec.ts
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create environment configuration:
```bash
cp .env.example .env
```

3. Update `.env` file with your target URL:
```
BASE_URL=https://your-target-website.com
TEST_TIMEOUT=30000
```

## Running Tests

```bash
# Run all tests
npx playwright test

# Run specific test file
npx playwright test tests/specs/end-to-end-search-scenario.spec.ts

# Run tests with UI
npx playwright test --ui
```

## Test Scenarios

### End-to-End Search Flow
1. **Institution Search**: Navigate from top page through prefecture → city → grade selection to search results
2. **Institution Detail Navigation**: Click on search results to reach institution detail pages
3. **Pricing Inquiry**: Navigate to pricing request pages from search results

### Page Object Model
- Uses Page Object Model pattern for maintainable test automation
- Supports dynamic element selection based on institution names and locations
- Environment-agnostic configuration for different target websites

## Configuration

- **Environment Variables**: All target URLs are configurable via `.env` file
- **Timeouts**: Configurable test timeouts
- **Anonymous Testing**: Code is designed to work with any educational institution search platform

## Browser Support

Tests run on multiple browsers as configured in `playwright.config.ts`:
- Chromium
- Firefox  
- Safari (WebKit)

## CI/CD Ready

This project is configured for continuous integration with proper environment variable handling and anonymized code suitable for public repositories.

---

## React Development (Optional)

This project also includes a React frontend setup with TypeScript + Vite for UI development.

### React Setup
- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh
