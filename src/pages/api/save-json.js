import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { data } = req.body;
    const fileName =  req.query.fileName

    console.log("save json called")

    console.log("fileName", fileName)

    console.log("saving file")

    const filePath = path.join(process.cwd(), 'public', `${fileName}.json`);
    fs.writeFile(filePath, JSON.stringify(data, null, 2), (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to save file' });
      }

      return res.status(200).json({ message: 'File saved successfully' });
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
