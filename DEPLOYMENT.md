# Deployment Guide

This guide explains how to set up and deploy the SnapFit Workshop game to GitHub Pages.

## Initial Setup

### 1. Enable GitHub Pages

1. Go to your GitHub repository: https://github.com/fukaishi/3dmodel-demo
2. Click on **Settings** (top menu)
3. In the left sidebar, click **Pages**
4. Under "Build and deployment":
   - **Source**: Select "GitHub Actions"
   - This will allow the workflow to deploy automatically

### 2. Verify Workflow Permissions

1. In your repository, go to **Settings** → **Actions** → **General**
2. Scroll down to "Workflow permissions"
3. Ensure "Read and write permissions" is selected
4. Check "Allow GitHub Actions to create and approve pull requests"
5. Click **Save**

## Automatic Deployment

Once set up, the deployment happens automatically:

1. **Trigger**: Any push to the `main` branch
2. **Build**: GitHub Actions runs `npm ci` and `npm run build`
3. **Deploy**: The `dist` folder is deployed to GitHub Pages
4. **URL**: https://fukaishi.github.io/3dmodel-demo/

## Manual Deployment

To trigger a manual deployment:

1. Go to the **Actions** tab in your repository
2. Select the "Deploy to GitHub Pages" workflow
3. Click "Run workflow" button
4. Select the branch (usually `main`)
5. Click "Run workflow"

## Monitoring Deployments

### View Deployment Status

1. Go to the **Actions** tab
2. You'll see all workflow runs
3. Click on any run to see detailed logs
4. A green checkmark ✓ means successful deployment
5. A red X ✗ means there was an error

### View Live Site

After successful deployment (usually takes 1-3 minutes):

- Visit: https://fukaishi.github.io/3dmodel-demo/
- Or click the "Deployments" section in the repository sidebar

## Troubleshooting

### Build Fails

If the build fails in GitHub Actions:

1. Check the workflow logs in the Actions tab
2. Common issues:
   - TypeScript errors: Fix type errors locally with `npm run build`
   - Missing dependencies: Ensure `package.json` is up to date
   - Node version: Check if the workflow uses the correct Node version

### 404 Error on GitHub Pages

If you get a 404 error:

1. Check that GitHub Pages is enabled (Settings → Pages)
2. Verify the base path in `vite.config.ts`:
   ```ts
   base: process.env.NODE_ENV === 'production' ? '/3dmodel-demo/' : '/',
   ```
3. Ensure the repository name matches the base path

### Assets Not Loading

If the game loads but 3D models or styles are missing:

1. Check browser console for 404 errors
2. Verify all asset paths are relative (start with `./` or `/`)
3. Ensure `vite.config.ts` has the correct base path

## Local Testing of Production Build

To test the production build locally before deploying:

```bash
# Build for production
npm run build

# Preview the production build
npm run preview
```

The preview server will use the production base path, so some assets might not load correctly locally. This is expected.

## Updating the Deployment

To update the live site:

1. Make your changes locally
2. Test with `npm run dev`
3. Commit and push to the `main` branch:
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```
4. GitHub Actions will automatically deploy the changes
5. Wait 1-3 minutes for deployment to complete
6. Refresh https://fukaishi.github.io/3dmodel-demo/

## Custom Domain (Optional)

To use a custom domain:

1. In repository Settings → Pages
2. Under "Custom domain", enter your domain
3. Create a CNAME file in the `public` folder:
   ```
   yourdomain.com
   ```
4. Configure DNS with your domain provider:
   - Add a CNAME record pointing to `fukaishi.github.io`
   - Or add A records for GitHub Pages IPs

## Rollback

To rollback to a previous version:

1. Find the commit hash of the version you want:
   ```bash
   git log --oneline
   ```
2. Revert to that commit:
   ```bash
   git revert <commit-hash>
   git push origin main
   ```
3. Or use GitHub's "Revert" button on the commit

## Security

GitHub Actions secrets (if needed):

1. Go to Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add any required secrets (none needed for basic GitHub Pages)

## Status Badge

The README includes a status badge showing deployment status:

[![Deploy to GitHub Pages](https://github.com/fukaishi/3dmodel-demo/actions/workflows/deploy.yml/badge.svg)](https://github.com/fukaishi/3dmodel-demo/actions/workflows/deploy.yml)

This badge automatically updates based on the latest workflow run.
