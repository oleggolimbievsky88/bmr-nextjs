# BMR Suspension E-commerce Site

This is a Next.js application built with the App Router for BMR Suspension.

## Development

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Copy `.env.example` to `.env.local` and fill in your database credentials:
   ```
   cp .env.example .env.local
   ```
4. Start the development server:
   ```
   npm run dev
   ```

## Deployment to Vercel

When deploying to Vercel, make sure to configure the following environment variables in your Vercel project settings:

- `MYSQL_HOST` - Your MySQL database host
- `MYSQL_USER` - Your MySQL database user
- `MYSQL_PASSWORD` - Your MySQL database password
- `MYSQL_DATABASE` - Your MySQL database name (usually "bmrsuspension")

## Troubleshooting

### API Route Errors (404/500)

If you encounter 404 errors for routes like `/fitment/[id]` or `/video/[id]`, make sure:

1. The directory structure in the `app` folder is correctly set up
2. The appropriate API routes exist in the `app/api` directory
3. The database connection environment variables are correctly set in Vercel

### Database Connection Errors (500)

If your API routes return 500 errors:

1. Check the Vercel logs for specific error messages
2. Verify your environment variables in Vercel project settings
3. Ensure your MySQL database is accessible from Vercel's deployment servers

## Required Routes

This application requires the following routes to function correctly:

- `/api/menu`
- `/api/products/new-products`
- `/api/platforms/[bodyID]`
- `/fitment/[id]`
- `/video/[id]`
- `/bmr-merchandise`
- `/gift-cards`

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
