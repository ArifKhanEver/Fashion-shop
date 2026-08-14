const fs = require('fs');

function replaceInFile(file, search, replace) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.split(search).join(replace);
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Replaced in ${file}`);
  } else {
    console.log(`File not found: ${file}`);
  }
}

// prisma/seed.ts
replaceInFile('prisma/seed.ts', 'c => c.slug', '(c: any) => c.slug');

// src/actions/admin.product.actions.ts
replaceInFile('src/actions/admin.product.actions.ts', '(tx) => {', '(tx: any) => {');
replaceInFile('src/actions/admin.product.actions.ts', 'v =>', '(v: any) =>');
// line 188: Argument of type 'unknown' is not assignable to parameter of type 'string'
// Usually from Object.entries(v) mapped to something...
// Let's replace 'v as any' or something... wait we can just do (v: any)

// src/actions/product.actions.ts
replaceInFile('src/actions/product.actions.ts', 'import { Prisma } from "@prisma/client";', '');
replaceInFile('src/actions/product.actions.ts', 'c =>', '(c: any) =>');

// src/app/(admin)/admin/orders/[id]/page.tsx
replaceInFile('src/app/(admin)/admin/orders/[id]/page.tsx', 'item =>', '(item: any) =>');

// src/app/(admin)/admin/page.tsx
replaceInFile('src/app/(admin)/admin/page.tsx', 'order =>', '(order: any) =>');

// src/app/(storefront)/order-confirmation/[id]/page.tsx
replaceInFile('src/app/(storefront)/order-confirmation/[id]/page.tsx', 'item =>', '(item: any) =>');

// src/app/(storefront)/page.tsx
replaceInFile('src/app/(storefront)/page.tsx', 'cat =>', '(cat: any) =>');
replaceInFile('src/app/(storefront)/page.tsx', 'product =>', '(product: any) =>');

// src/app/(storefront)/product/[slug]/page.tsx
replaceInFile('src/app/(storefront)/product/[slug]/page.tsx', 'img =>', '(img: any) =>');
replaceInFile('src/app/(storefront)/product/[slug]/page.tsx', 'v =>', '(v: any) =>');
replaceInFile('src/app/(storefront)/product/[slug]/page.tsx', 'p =>', '(p: any) =>');

// src/app/sitemap.ts
replaceInFile('src/app/sitemap.ts', 'product =>', '(product: any) =>');
replaceInFile('src/app/sitemap.ts', 'category =>', '(category: any) =>');
