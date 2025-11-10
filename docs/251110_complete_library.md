# Complete Vue Timelines Library - Implementation Plan

## Goal, Context

This document outlines the plan to complete the `vue-timelines` library, transforming it from an unfinished Vue component into a production-ready, reusable library that can be:

1. **Used as a Web Component in Angular applications** - The library must be consumable as a custom element that Angular can integrate
2. **API-agnostic** - Abstract all API calls into a service layer that consumers can provide/override
3. **Themeable** - Support CSS theming for complete visual customization
4. **Production-ready** - Fix all dependency issues, ensure proper builds, and maintain clean commit history

### Current State

- Vue 3 timeline component with drag-and-drop task management
- Uses Vuex for state management
- API calls are hardcoded in `src/store/modules/api.js` using `process.env.VUE_APP_API_BASE_URL` and `process.env.VUE_APP_API_TOKEN`
- CSS styles are scattered across component files with hardcoded colors
- Package dependencies updated (some deprecation warnings remain from transitive dependencies like @achrinza/node-ipc via Vue CLI, but don't affect functionality)
- No web component wrapper
- No theming system

## Principles, Key Decisions

1. **Backward Compatibility**: Maintain existing Vue component API while adding web component support
2. **Framework Agnostic**: Web component should work in any framework (Angular, React, Vue, vanilla JS)
3. **Progressive Enhancement**: Library should work without API (for demo/static use) and with custom API providers
4. **CSS Custom Properties**: Use CSS variables for theming to allow runtime theme switching
5. **Semantic Versioning**: Follow semver for releases
6. **Conventional Commits**: Use conventional commit format for clean history

## Actions

### Phase 1: Fix Dependencies and Build System

- [x] **Update all dependencies**
  - [x] Run `npm install` to update package-lock.json with new versions
  - [ ] Test that build still works: `npm run build`
  - [x] Verify engine warnings (note: @achrinza/node-ipc warning remains as transitive dependency from Vue CLI, but doesn't affect functionality)
  - [x] Update `@babel/eslint-parser` configuration in `package.json`
  - [x] Add `rimraf` to devDependencies
  - [x] Replace deprecated `rollup-plugin-terser` with `@rollup/plugin-terser`
  - [x] Fix npm vulnerabilities using `npm audit fix` and npm overrides
    - [x] Fixed @babel/runtime vulnerability (moderate)
    - [x] Fixed cross-spawn vulnerability (high) via override
    - [x] Fixed postcss vulnerability (moderate) via override
    - [x] Note: webpack-dev-server vulnerability (moderate) remains - it's a dev-only dependency from Vue CLI and fixing it would break the build system. This only affects development server, not production builds.

- [x] **Fix build scripts**
  - [x] Update `package.json` build script to use proper command chaining (use `&&` instead of `&`)
  - [ ] Ensure all build outputs (UMD, ESM, IIFE) work correctly
  - [ ] Test that dist files are generated properly

- [x] **Update Rollup configuration**
  - [x] Update to Rollup 4 format (multiple outputs in array)
  - [x] Replace deprecated `rollup-plugin-terser` with `@rollup/plugin-terser`
  - [ ] Test that Vue SFC compilation works
  - [ ] Verify external dependencies are handled correctly

### Phase 2: API Service Abstraction

- [ ] **Create API service interface**
  - [ ] Create `src/services/api-service.js` with interface/abstract class
  - [ ] Define methods: `createTimeline(timeline)`, `updateTask(task)`, `createGroup(group)`, `fetchTimeline(id)`, etc.
  - [ ] Create default implementation `src/services/default-api-service.js` that uses current fetch-based approach
  - [ ] Create no-op implementation `src/services/noop-api-service.js` for demo/static use

- [ ] **Refactor Vuex store to use service**
  - [ ] Update `src/store/modules/api.js` to accept API service via dependency injection
  - [ ] Remove hardcoded `process.env` references from store
  - [ ] Make API service configurable via plugin options or provide/inject

- [ ] **Update component to accept API service**
  - [ ] Modify `MyTimeline.vue` to accept `apiService` prop or inject
  - [ ] Pass API service to Vuex store initialization
  - [ ] Update `src/index.js` to allow API service configuration during install

- [ ] **Document API service interface**
  - [ ] Create `docs/API_SERVICE.md` with interface documentation
  - [ ] Provide examples for custom API service implementations
  - [ ] Show how to use with different backends (REST, GraphQL, etc.)

### Phase 3: CSS Theming System

- [ ] **Audit existing styles**
  - [ ] List all hardcoded colors, fonts, spacing in components
  - [ ] Document current color scheme and design tokens

- [ ] **Create CSS custom properties system**
  - [ ] Create `src/styles/themes/default.css` with CSS variables
  - [ ] Define variables for: colors (primary, secondary, background, text, borders), spacing, fonts, border-radius, shadows
  - [ ] Replace hardcoded values in components with CSS variables
  - [ ] Create `src/styles/themes/dark.css` as example alternative theme

- [ ] **Implement theme provider**
  - [ ] Create `src/utils/theme-provider.js` utility
  - [ ] Allow theme switching via class on root element or CSS import
  - [ ] Document how to create custom themes

- [ ] **Update build to include themes**
  - [ ] Ensure theme CSS files are included in dist builds
  - [ ] Create separate theme files that can be imported independently
  - [ ] Update rollup config to handle CSS properly

- [ ] **Document theming**
  - [ ] Create `docs/THEMING.md` with theming guide
  - [ ] Provide examples of custom themes
  - [ ] Show how to override specific component styles

### Phase 4: Web Component Wrapper

- [ ] **Research and plan web component approach**
  - [ ] Evaluate `@vue/web-component-wrapper` or `@custom-elements-manifest/analyzer`
  - [ ] Consider using `defineCustomElement` from Vue 3
  - [ ] Plan how to handle Vuex store in web component context

- [ ] **Create web component wrapper**
  - [ ] Create `src/web-component.js` entry point
  - [ ] Wrap `MyTimeline.vue` as custom element
  - [ ] Map Vue props to web component attributes/properties
  - [ ] Handle events (convert Vue emits to custom events)
  - [ ] Handle slots if needed

- [ ] **Handle state management in web component**
  - [ ] Create isolated Vuex store instance per web component instance
  - [ ] Allow API service to be passed via attribute or property
  - [ ] Ensure no global state leakage between instances

- [ ] **Update build configuration**
  - [ ] Add web component build target to rollup config
  - [ ] Create `dist/vue-timelines-wc.js` bundle
  - [ ] Ensure Vue is bundled (not external) for web component build
  - [ ] Test that web component can be loaded in HTML page

- [ ] **Test web component in Angular**
  - [ ] Create simple Angular test app
  - [ ] Import and use web component
  - [ ] Test prop binding, event handling, API service injection
  - [ ] Verify theming works in Angular context

- [ ] **Document web component usage**
  - [ ] Create `docs/WEB_COMPONENT.md` with usage guide
  - [ ] Provide Angular integration examples
  - [ ] Document all available attributes, properties, and events

### Phase 5: Testing and Quality

- [ ] **Set up testing framework**
  - [ ] Add Vitest or Jest for unit tests
  - [ ] Add Vue Test Utils for component testing
  - [ ] Create test structure

- [ ] **Write core tests**
  - [ ] Test API service interface implementations
  - [ ] Test theme provider
  - [ ] Test web component wrapper
  - [ ] Test key component functionality (task drag, resize, etc.)

- [ ] **Fix linting issues**
  - [ ] Update ESLint configuration for Vue 3
  - [ ] Fix all linting errors
  - [ ] Add linting to CI/pre-commit hooks

- [ ] **Add TypeScript definitions (optional)**
  - [ ] Create `index.d.ts` for TypeScript support
  - [ ] Define types for API service interface
  - [ ] Define types for component props and events

### Phase 6: Documentation and Examples

- [ ] **Update README**
  - [ ] Add installation instructions for web component
  - [ ] Add API service configuration examples
  - [ ] Add theming examples
  - [ ] Add Angular integration guide
  - [ ] Update usage examples

- [ ] **Create example projects**
  - [ ] Create `examples/angular/` with Angular integration example
  - [ ] Create `examples/vue/` with Vue integration example
  - [ ] Create `examples/vanilla/` with vanilla JS example
  - [ ] Show different API service implementations

- [ ] **Create migration guide**
  - [ ] Document breaking changes (if any)
  - [ ] Show how to migrate from old API to new service-based API
  - [ ] Show how to migrate styles to use CSS variables

### Phase 7: Release Preparation

- [ ] **Version management**
  - [ ] Update version in package.json following semver
  - [ ] Create CHANGELOG.md
  - [ ] Document all changes

- [ ] **Final testing**
  - [ ] Test in multiple browsers (Chrome, Firefox, Safari, Edge)
  - [ ] Test in Angular application
  - [ ] Test with different API service implementations
  - [ ] Test theme switching

- [ ] **Prepare for open source**
  - [ ] Ensure LICENSE file is present and correct
  - [ ] Add CONTRIBUTING.md with contribution guidelines
  - [ ] Add CODE_OF_CONDUCT.md if needed
  - [ ] Ensure all dependencies have compatible licenses

## Commit Guidelines

### Conventional Commits Format

All commits must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Commit Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `refactor`: Code refactoring without feature changes or bug fixes
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks (dependencies, build, etc.)
- `build`: Build system changes
- `ci`: CI configuration changes

### Scope Examples

- `api`: API service abstraction
- `theme`: Theming system
- `wc`: Web component
- `deps`: Dependencies
- `build`: Build system
- `docs`: Documentation

### Examples

```
feat(api): add API service interface and default implementation

Create abstract API service interface that allows consumers to
provide their own API implementation. Includes default fetch-based
service and no-op service for static use.

BREAKING CHANGE: API calls now require service injection

fix(theme): correct CSS variable names for task colors

docs(wc): add Angular integration guide

chore(deps): update all dependencies to latest versions

refactor(store): extract API calls to service layer
```

### Commit Frequency

- Commit after each logical unit of work (not just at end of day)
- Make small, focused commits rather than large monolithic ones
- Commit working code (tests pass, no broken functionality)
- Use `--no-verify` only when absolutely necessary and document why

### Branch Strategy

- Use feature branches for new work: `git checkout -b feat/api-service-abstraction`
- Keep commits on feature branch until feature is complete
- Squash commits when merging to main if needed for clarity
- Use descriptive branch names matching commit type/scope

## Appendix

### Current API Structure

The current API module (`src/store/modules/api.js`) uses:
- `process.env.VUE_APP_API_BASE_URL` - Base URL for API
- `process.env.VUE_APP_API_TOKEN` - Authentication token in `HTTP_KEY` header
- Endpoints:
  - `POST /events/create` - Create timeline or group
  - Response format: `{ status: "success", event: {...} }`

### Current Component Structure

- `MyTimeline.vue` - Main timeline component
- `src/components/Timeline/` - Timeline rendering components
- `src/components/List/` - Group list components
- `src/store/` - Vuex store with API module
- `src/utils/` - Utility functions

### Key Files to Modify

- `src/store/modules/api.js` - Extract API calls
- `src/MyTimeline.vue` - Add API service prop, theme support
- `src/index.js` - Add web component export, API service config
- `rollup.config.js` - Add web component build
- `package.json` - Update dependencies, add scripts
- All component `.vue` files - Replace hardcoded styles with CSS variables

### Example API Service Interface

```javascript
// src/services/api-service.js
export class ApiService {
  async createTimeline(timeline) { throw new Error('Not implemented'); }
  async updateTask(task) { throw new Error('Not implemented'); }
  async createGroup(group) { throw new Error('Not implemented'); }
  async fetchTimeline(id) { throw new Error('Not implemented'); }
}
```

### Example Theme CSS Variables

```css
:root {
  --vt-timeline-bg: #f8f9fc;
  --vt-task-bg-primary: tomato;
  --vt-task-bg-info: #3c8dbc;
  --vt-task-bg-success: #00a85d;
  --vt-text-color: #333;
  --vt-border-color: rgba(177, 184, 189, 0.45);
  --vt-cell-height: 40px;
  --vt-border-radius: 5px;
}
```

