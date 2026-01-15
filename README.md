# 🎭 Playwright Test Automation Framework

A modular, scalable test automation framework built with **Playwright** and **TypeScript** using the **Page Object Model (POM)** and **Module Pattern** architecture.

> **Created by [Pramod Dutta](https://thetestingacademy.com)** | [The Testing Academy](https://thetestingacademy.com)

---

## 📊 Architecture Documentation

For a comprehensive visual architecture guide, see:

- 📄 **[Architecture Diagram (HTML)](docs/ARCHITECTURE.html)** - Interactive visual documentation
- 📋 **[Quick Reference Guide](docs/QUICK_REFERENCE.md)** - Commands and best practices

### Architecture Overview

<p align="center">
  <img src="docs/images/arch.png" alt="Playwright Framework Architecture" width="800"/>
</p>

---

## 🌟 Key Features

- **Page Object Model (POM)** - Clean separation of test logic and page interactions
- **Module Pattern** - Business logic layer for complex workflows
- **API Testing Layer** - REST API testing with retry support
- **Custom Fixtures** - Pre-authenticated sessions and enhanced page handling
- **Multi-Browser Support** - Chrome, Firefox, Safari, and Mobile Chrome
- **TypeScript** - Full type safety and IntelliSense support
- **Parallel Execution** - Run tests in parallel across browsers

---

## 📁 Project Structure

```
Playwright_Framework/
├── src/
│   ├── api/                    # API testing layer
│   │   ├── AuthApi.ts          # Authentication API methods
│   │   ├── ProductApi.ts       # Product API methods
│   │   ├── OrderApi.ts         # Order API methods
│   │   └── index.ts            # API exports
│   ├── config/
│   │   └── index.ts            # Configuration & test data constants
│   ├── fixtures/
│   │   ├── auth.fixture.ts     # Pre-authenticated session fixtures
│   │   └── index.ts            # Main fixtures with page objects & modules
│   ├── modules/                # Business logic layer
│   │   ├── LoginModule.ts      # Login workflows
│   │   ├── ProductModule.ts    # Product workflows
│   │   ├── CheckoutModule.ts   # Checkout workflows
│   │   └── index.ts            # Module exports
│   ├── pages/                  # Page Object Model layer
│   │   ├── LoginPage.ts        # Login page locators & actions
│   │   ├── HomePage.ts         # Home page locators & actions
│   │   ├── ProductPage.ts      # Product page locators & actions
│   │   ├── CheckoutPage.ts     # Checkout page locators & actions
│   │   └── index.ts            # Page exports
│   ├── testdata/
│   │   ├── users.json          # User test data
│   │   ├── products.json       # Product test data
│   │   └── types.ts            # TypeScript type definitions
│   ├── tests/
│   │   ├── login.spec.ts       # Login test specifications
│   │   ├── product.spec.ts     # Product test specifications
│   │   └── checkout.spec.ts    # Checkout test specifications
│   └── utils/
│       ├── Logger.ts           # Structured logging utility
│       ├── WaitHelper.ts       # Custom wait conditions
│       ├── DataGenerator.ts    # Random test data generation
│       ├── ApiHelper.ts        # HTTP request helper with retry
│       └── index.ts            # Utility exports
├── playwright.config.ts        # Playwright configuration
├── tsconfig.json               # TypeScript configuration
├── package.json                # NPM scripts & dependencies
├── .env                        # Environment variables
└── .gitignore                  # Git ignore rules
```

---

## 🏗️ Architecture

### Three-Layer Architecture

The framework follows a **3-layer architecture** that promotes separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                    LAYER 3: TESTS                           │
│  (Test Specifications - login.spec.ts, product.spec.ts)     │
│  • Test scenarios and assertions                            │
│  • Uses Modules for business workflows                      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   LAYER 2: MODULES                          │
│  (Business Logic - LoginModule, ProductModule, etc.)        │
│  • Complex workflows and business logic                     │
│  • Orchestrates multiple Page actions                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    LAYER 1: PAGES                           │
│  (Page Objects - LoginPage, ProductPage, etc.)              │
│  • Locators defined as arrow functions                      │
│  • Basic UI actions (click, fill, navigate)                 │
│  • No business logic                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

### Configuration

Update the `.env` file with your environment settings:

```env
BASE_URL=https://your-app-url.com
TEST_USERNAME=testuser
TEST_PASSWORD=testpass123
API_TIMEOUT=30000
```

---

## 📜 Available Scripts

| Command                 | Description                    |
| ----------------------- | ------------------------------ |
| `npm test`              | Run all tests in headless mode |
| `npm run test:headed`   | Run tests with browser visible |
| `npm run test:ui`       | Open Playwright UI mode        |
| `npm run test:debug`    | Debug tests with inspector     |
| `npm run test:chromium` | Run only Chromium tests        |
| `npm run test:firefox`  | Run only Firefox tests         |
| `npm run test:webkit`   | Run only WebKit tests          |
| `npm run test:mobile`   | Run mobile Chrome tests        |
| `npm run test:report`   | Show HTML test report          |
| `npm run build`         | Compile TypeScript             |
| `npm run clean`         | Clean build artifacts          |

---

## 🧪 Test Coverage

| Test File          | Test Cases                      | Description                     |
| ------------------ | ------------------------------- | ------------------------------- |
| `login.spec.ts`    | 11                              | Login, logout, validation       |
| `product.spec.ts`  | 15                              | Product details, cart, wishlist |
| `checkout.spec.ts` | 10                              | Checkout flow, promo codes      |
| **Total**          | **36 tests × 4 browsers = 144** |                                 |

---

## 📊 Flow Diagrams

### Test Execution Flow

```mermaid
flowchart TB
    subgraph Tests["Layer 3: Test Specifications"]
        T1[login.spec.ts]
        T2[product.spec.ts]
        T3[checkout.spec.ts]
    end

    subgraph Modules["Layer 2: Business Modules"]
        M1[LoginModule]
        M2[ProductModule]
        M3[CheckoutModule]
    end

    subgraph Pages["Layer 1: Page Objects"]
        P1[LoginPage]
        P2[HomePage]
        P3[ProductPage]
        P4[CheckoutPage]
    end

    subgraph Support["Support Layer"]
        F[Fixtures]
        U[Utilities]
        A[API Layer]
        C[Config]
    end

    T1 --> M1
    T2 --> M2
    T3 --> M3

    M1 --> P1
    M1 --> P2
    M2 --> P3
    M2 --> P2
    M3 --> P4
    M3 --> P3

    Tests --> F
    Tests --> U
    Modules --> A
    Modules --> C
```

### Login Flow Example

```mermaid
sequenceDiagram
    participant Test as login.spec.ts
    participant Module as LoginModule
    participant Page as LoginPage
    participant Browser as Browser

    Test->>Module: doLogin(username, password)
    Module->>Page: navigate()
    Page->>Browser: goto('/login')
    Module->>Page: enterUsername(username)
    Page->>Browser: fill('#username', username)
    Module->>Page: enterPassword(password)
    Page->>Browser: fill('#password', password)
    Module->>Page: clickLogin()
    Page->>Browser: click('#login-btn')
    Module->>Page: waitForNavigation()
    Page-->>Module: success
    Module-->>Test: logged in
```

### Checkout Flow

```mermaid
flowchart LR
    A[Start] --> B[Login]
    B --> C[Browse Products]
    C --> D[Add to Cart]
    D --> E[Go to Checkout]
    E --> F[Fill Shipping]
    F --> G[Fill Payment]
    G --> H{Apply Promo?}
    H -->|Yes| I[Enter Promo Code]
    I --> J[Place Order]
    H -->|No| J
    J --> K[Order Confirmation]
    K --> L[End]
```

---

## 🔧 Usage Examples

### Using Page Objects

```typescript
import { LoginPage } from "../pages";

const loginPage = new LoginPage(page);
await loginPage.navigate();
await loginPage.enterUsername("user@example.com");
await loginPage.enterPassword("password123");
await loginPage.clickLogin();
```

### Using Modules

```typescript
import { LoginModule } from "../modules";

const loginModule = new LoginModule(page);
await loginModule.doLogin("user@example.com", "password123");
await loginModule.verifyLoggedIn();
```

### Using Fixtures

```typescript
import { test, expect } from "../fixtures";

test("should show dashboard after login", async ({ authenticatedPage }) => {
  // Page is already logged in via fixture
  await expect(
    authenticatedPage.locator('[data-testid="dashboard"]')
  ).toBeVisible();
});

test("with page objects", async ({ loginPage, homePage }) => {
  await loginPage.navigate();
  // Use pre-initialized page objects
});
```

### Using API Layer

```typescript
import { AuthApi, ProductApi } from "../api";

const authApi = new AuthApi();
const token = await authApi.login("user@example.com", "password");

const productApi = new ProductApi();
const products = await productApi.getProducts(token);
```

---

## 🛠️ Utilities

### Logger

```typescript
import { Logger } from "../utils";

const logger = new Logger("TestName");
logger.info("Starting test");
logger.debug("Debug information");
logger.error("Error occurred", error);
```

### WaitHelper

```typescript
import { WaitHelper } from "../utils";

const waitHelper = new WaitHelper(page);
await waitHelper.waitForCondition(async () => {
  return await page.locator(".loading").isHidden();
});
await waitHelper.retry(async () => await fetchData(), 3);
```

### DataGenerator

```typescript
import { DataGenerator } from "../utils";

const email = DataGenerator.randomEmail(); // user_abc123@test.com
const phone = DataGenerator.randomPhoneNumber(); // (555) 123-4567
const uuid = DataGenerator.uuid(); // 550e8400-e29b-41d4-a716-446655440000
```

---

## 📝 Writing New Tests

1. **Create Page Object** (if new page):

   ```typescript
   // src/pages/NewPage.ts
   export class NewPage {
     constructor(private page: Page) {}

     // Locators as arrow functions
     readonly submitButton = () => this.page.locator("#submit");

     // Actions
     async clickSubmit() {
       await this.submitButton().click();
     }
   }
   ```

2. **Create Module** (for business logic):

   ```typescript
   // src/modules/NewModule.ts
   export class NewModule {
     private newPage: NewPage;

     constructor(page: Page) {
       this.newPage = new NewPage(page);
     }

     async completeWorkflow() {
       // Orchestrate multiple page actions
     }
   }
   ```

3. **Write Test**:

   ```typescript
   // src/tests/new.spec.ts
   import { test, expect } from "../fixtures";
   import { NewModule } from "../modules";

   test("should complete workflow", async ({ page }) => {
     const module = new NewModule(page);
     await module.completeWorkflow();
     // Assertions
   });
   ```

---

## 📊 Custom TTA Reporter

This framework includes a **Custom TTA Reporter** - a beautiful, modern HTML reporter with real-time test execution updates.

### Features

| Feature | Description |
|---------|-------------|
| 🎨 **Modern UI** | Green-themed design with Google Fonts (Inter, JetBrains Mono) |
| 📊 **Stats Dashboard** | 6 metric cards showing Total, Passed, Failed, Skipped, Pass Rate, Duration |
| 📋 **Console Logs per Step** | Each `console.log()` in `test.step()` is captured and displayed |
| 🎬 **Screenshots & Videos** | Auto-captured on failure with inline previews |
| 📍 **Trace Viewer** | Direct links to Playwright trace files |
| 🔍 **Filters** | Filter by Priority (P0, P1, P2) and Status (Passed/Failed/Skipped) |
| ⏱️ **Real-time Updates** | Live console output during test execution |

### Report Screenshot

<p align="center">
  <img src="docs/images/report.png" alt="TTA Custom Reporter Screenshot" width="800"/>
</p>

### Usage

The reporter is automatically configured in `playwright.config.ts`:

```typescript
reporter: [
    ['./src/utils/CustomTTAReporter.ts'],
    ['html', { open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list'],
],
```

### Console Log Capture

Capture console logs in your test steps:

```typescript
test('example test', async ({ page }) => {
    await test.step('Verify page title', async () => {
        const title = await page.title();
        console.log(`Page Title: ${title}`);  // ← Appears in step's console output
        expect(title).toBeTruthy();
    });
});
```

Reports are generated in `tta-report/` directory with timestamped filenames.

---

## 📈 Reports

After running tests, view the HTML report:

```bash
npm run test:report
```

Reports are generated in:

- `tta-report/` - Custom TTA HTML reports (recommended)
- `playwright-report/` - Default Playwright HTML report
- `test-results/` - JSON results and screenshots

---

## 🤝 Contributing

1. Follow the existing architecture patterns
2. Keep Page Objects focused on locators and basic actions
3. Put business logic in Modules
4. Write descriptive test names
5. Use TypeScript types consistently

### AI Assistant Rules

This project includes rules for AI code assistants:

- 📁 **`.augment/rules/`** - Augment Code AI rules
- 📁 **`.github/copilot-instructions.md`** - GitHub Copilot instructions

These rules ensure AI assistants follow the framework's patterns when generating code.

---

## 📚 Documentation Structure

```
docs/
├── ARCHITECTURE.html      # Visual architecture diagram
└── QUICK_REFERENCE.md     # Commands & best practices

.augment/
└── rules/
    ├── framework-rules.md      # Page Object & Module patterns
    └── code-standards.md       # Coding standards

.github/
└── copilot-instructions.md    # GitHub Copilot rules
```

---

## 📄 License

ISC

---

## 👨‍💻 Author

**Pramod Dutta**
- Website: [thetestingacademy.com](https://thetestingacademy.com)
- GitHub: [@pmdutta](https://github.com/pmdutta)

---

<p align="center">
  Built with ❤️ by <a href="https://thetestingacademy.com">The Testing Academy</a>
</p>
