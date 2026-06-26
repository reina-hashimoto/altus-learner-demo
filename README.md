# Altus — Learner

Functional prototype of the **learner-side Altus experience** for Udemy Business: the
admin-assigned goal journey, where a learner self-assesses their skills and Altus shapes a
learning path toward an organization goal.

Sibling to the admin/leader-side `admin-agent` prototype. Reproduces the Figma
*"Altus Learner Exp (ex-Skills Journey)"* flows as clickable React.

## Stack

- **Vite 6 · React 19 · TypeScript** (strict)
- **Tailwind v4** wired to real **Udemy design-system tokens** (`src/styles/ds-tokens.css`) as
  semantic utilities — no raw hex. shadcn-style primitives bridged to Udemy tokens.
- **react-router 7** · **motion** · **recharts** · **lucide** + vendored real Udemy Thesis icons
- Token-grounded stand-ins for `@udemy-v2/*` (the real DS needs React 19 **and** a working
  Artifactory token; built so the swap is migration-free).

## Flows

4 scenarios × 2 personas (Product Manager / Data Scientist):

1. **Fixed LP** — org-curated path, learner self-assesses ✅ *(PM built)*
2. **Suggested LP** — Altus proposes a path to approve
3. **No LP** — Altus builds a path from scratch
4. **No Skills + LP** — Altus defines both skills and path

The flow index (`/`) lists every scenario; built flows are playable, the rest are marked *Soon*.

## Develop

```bash
npm install
npm run dev        # http://localhost:5173
npm run build
npm run type-check
```
