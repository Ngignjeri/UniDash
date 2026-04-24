# UniDash — Campus Delivery Made Fast

UniDash is a three-sided campus delivery marketplace that connects **students**, **campus retailers**, and **student riders** in a single Next.js application.

- 👤 **Student App** — register/login, browse items from campus shops, place orders, track delivery progress.
- 🏪 **Retailer Dashboard** — add products, manage availability, accept incoming orders and mark them ready for pickup.
- 🚴 **Rider App** — browse orders ready for pickup, accept a job, update delivery status end-to-end.

## Stack

- [Next.js 14](https://nextjs.org/) (App Router, Server Components, Route Handlers)
- [Prisma](https://www.prisma.io/) + SQLite (zero-config local dev; swap `provider` for Postgres in production)
- [NextAuth.js](https://next-auth.js.org/) — credentials provider with JWT sessions
- [Tailwind CSS](https://tailwindcss.com/) — custom `brand` (yellow) and `ink` (dark) palette
- TypeScript end-to-end, Zod for API input validation

## Quick start

```bash
npm install
npx prisma migrate dev          # create SQLite DB + run migrations
npm run db:seed                  # seed demo data and test accounts
npm run dev
```

Then open http://localhost:3000.

## Demo accounts (created by seed)

All seeded accounts share the password **`password123`**.

| Role     | Email              | Notes                              |
| -------- | ------------------ | ---------------------------------- |
| Student  | `student@uni.edu`  | Pre-filled hostel/room info        |
| Retailer | `shop@uni.edu`     | Owns **Campus Bites** with menu    |
| Retailer | `mart@uni.edu`     | Owns **UniMart** with supplies     |
| Rider    | `rider@uni.edu`    | Marked AVAILABLE                   |

## Order lifecycle

```
PENDING → ACCEPTED → PREPARING → READY_FOR_PICKUP
       ↓ (retailer)                       ↓ (rider accepts)
       CANCELLED                   PICKED_UP → OUT_FOR_DELIVERY → DELIVERED
```

- **Student** places an order → status `PENDING`.
- **Retailer** accepts → prepares → marks ready for pickup.
- **Rider** sees the job in `Available jobs`, accepts it, then marches the order through pickup and delivery.
- **Student** sees live progress on the order detail page.

## Project layout

```
prisma/
  schema.prisma           # User, Retailer, Product, Order, OrderItem, OrderEvent
  seed.ts                 # idempotent demo seed
src/
  app/
    page.tsx              # public landing
    login/, register/     # auth pages
    student/              # student browse + orders
    retailer/             # retailer orders + product mgmt
    rider/                # available jobs + active deliveries
    api/
      auth/[...nextauth]/ # NextAuth handler
      register/           # POST /api/register
      products/           # GET list (public), POST/PATCH/DELETE (retailer)
      orders/             # GET (role-scoped), POST (student), PATCH (status)
      orders/[id]/accept/ # POST — rider accepts a ready job
      orders/available/   # GET — rider's open job feed
  components/              # Logo, AppHeader, StatusBadge
  lib/                     # prisma client, auth options, session helpers, shared types
  middleware.ts            # role-based route protection
```

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run lint` — ESLint
- `npm run db:migrate` — `prisma migrate deploy`
- `npm run db:reset` — reset + reseed the dev DB
- `npm run db:seed` — run the seed script

## Notes

- SQLite doesn't support enums, so `User.role` and `Order.status` are stored as strings and validated in application code via the union types in `src/lib/types.ts`.
- The logo at `public/unidash-logo.png` is designed for dark backgrounds — the app header uses `bg-ink-900` to display it correctly.
