import { list } from '@vercel/blob';


// export const runtime = 'edge';

export default async (req, res) => {
  const listResponse = await list();
  const blobs = listResponse.blobs
  



  res.status(200).json({})
}


