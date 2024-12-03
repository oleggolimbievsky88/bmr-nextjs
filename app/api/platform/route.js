import { NextResponse } from 'next/server';
import { getPlatformById } from '@/lib/queries';

export async function GET(request, { params }) {
  console.log('Route params:', params); // Debugging to check params
  
  const { id } = params; // Get platform ID from the route parameters

  if (!id) {
    console.error('Platform ID is missing in the route parameters');
    return NextResponse.json({ error: 'Platform ID is missing' }, { status: 400 });
  }

  try {
    const products = await getPlatformById(id);
    return NextResponse.json(products);
  } catch (error) {
    console.error(`Failed to fetch products for platform ${id}:`, error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

// import { NextResponse } from 'next/server';
// import { getPlatformById, getPlatformByName } from '@/lib/queries';

// export async function GET(req) {
//   const { searchParams } = new URL(req.url);
//   const id = searchParams.get('id');
//   const name = searchParams.get('name');

//   try {
//     let platform;

//     if (id) {
//       // Fetch platform by ID if `id` is provided
//       platform = await getPlatformById(product.id);
//     } else if (name) {
//       // Fetch platform by name if `name` is provided
//       platform = await getPlatformByName(name);
//     } else {
//       return NextResponse.json(
//         { error: 'Missing required parameters: id or name' },
//         { status: 400 }
//       );
//     }

//     if (!platform) {
//       return NextResponse.json(
//         { error: 'Platform not found' },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json(platform);
//   } catch (error) {
//     return NextResponse.json(
//       { error: error.message },
//       { status: 500 }
//     );
//   }
// }

