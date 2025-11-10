# Publishing to NPM

## Prerequisites

1. Create an npm account at https://www.npmjs.com/
2. Login via CLI: `npm login`
3. Ensure you have access to publish the `vue-timelines` package

## Pre-Publish Checklist

- [ ] Update version in `package.json` (follow semver)
- [ ] Run `npm run build:all` to ensure all builds are up to date
- [ ] Test the package locally: `npm pack` and test the tarball
- [ ] Update CHANGELOG.md with changes
- [ ] Ensure README.md is up to date
- [ ] Check that LICENSE file exists
- [ ] Verify all files in `files` array in package.json are correct

## Publishing Steps

### 1. Build the Package

```bash
npm run build:all
```

This will:
- Build UMD, ESM, and IIFE formats
- Build web component bundle
- Run automatically via `prepublishOnly` hook

### 2. Test Package Locally

```bash
# Create a tarball
npm pack

# This creates vue-timelines-0.2.1.tgz
# Test it in another project:
cd /path/to/test-project
npm install /path/to/vue-timelines/vue-timelines-0.2.1.tgz
```

### 3. Check What Will Be Published

```bash
npm publish --dry-run
```

This shows what files will be included without actually publishing.

### 4. Publish to NPM

#### First Time / New Package

```bash
npm publish --access public
```

The `--access public` flag is needed for scoped packages or new packages.

#### Update Existing Package

```bash
# Update version first
npm version patch  # or minor, major
# or manually edit package.json

# Then publish
npm publish
```

### 5. Verify Publication

Check https://www.npmjs.com/package/vue-timelines

## Version Management

Use semantic versioning (semver):

- **Patch** (0.2.1 → 0.2.2): Bug fixes
- **Minor** (0.2.1 → 0.3.0): New features, backward compatible
- **Major** (0.2.1 → 1.0.0): Breaking changes

```bash
npm version patch   # 0.2.1 → 0.2.2
npm version minor   # 0.2.1 → 0.3.0
npm version major   # 0.2.1 → 1.0.0
```

## Package Contents

The published package includes:

- `dist/` - All built files (UMD, ESM, IIFE, Web Component)
- `src/` - Source files for tree-shaking
- `README.md` - Documentation
- `LICENSE` - License file
- `docs/` - Additional documentation
- `package.json` - Package metadata

## Post-Publish

1. Create a git tag: `git tag v0.2.1 && git push --tags`
2. Update GitHub releases if applicable
3. Announce the release

## Troubleshooting

### "You do not have permission to publish"

- Check you're logged in: `npm whoami`
- Verify package name is available
- Check if package is scoped and you have access

### "Package name already exists"

- The package name `vue-timelines` might be taken
- Consider using a scoped name: `@your-org/vue-timelines`
- Update package.json `name` field

### Build Fails

- Ensure all dependencies are installed: `npm install`
- Check Node.js version matches `engines` requirement
- Review build errors and fix

