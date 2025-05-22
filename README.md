# Deployment Instructions for Cloudflare Pages

This project is a single-page responsive web app for the 3D T-shirt component with image and text printing.

## Deploying on Cloudflare Pages

1. Create a GitHub repository and push this project code to it.

2. Go to [Cloudflare Pages](https://pages.cloudflare.com/) and create a new project.

3. Connect your GitHub repository to Cloudflare Pages.

4. For the build settings:
   - Build command: leave empty (no build step needed)
   - Build output directory: `.` (root directory)

5. Deploy the site.

Cloudflare Pages will serve the static files directly.

## Notes

- The project uses vanilla JavaScript, CSS, and HTML.
- No frameworks or build tools are required.
- The site is responsive and works as a single page.
- To update the site, push changes to the GitHub repository and redeploy.

## Optional

- You can add Tailwind CSS or convert to Lit or Astro if desired, but it is not required for deployment.
