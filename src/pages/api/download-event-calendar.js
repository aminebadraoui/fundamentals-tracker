import { list } from '@vercel/blob';

export default async (req, res) => {
  const response = await list();
  const year = req.query.year;
  const fileName = `event_calendar_${year}.json`

  console.log(fileName)

  console.log(response);

  const blobs = response.blobs

  const fileBlob = blobs.find(blob => blob.pathname === fileName)

  const downloadUrl = fileBlob.url;

  console.log(downloadUrl);

  const fileResponse = await fetch(downloadUrl);

  const body = await fileResponse.json()

  const json = {
    [year]: body
  }

  console.log(json);
 

  res.status(200).json(json);
}