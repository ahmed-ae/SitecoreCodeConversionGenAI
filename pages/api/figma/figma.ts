import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const figmaAPI = axios.create({
  baseURL: 'https://api.figma.com/v1',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, query, body } = req;
  const figmaAccessToken = process.env.FIGMA_ACCESS_TOKEN;

  if (!figmaAccessToken) {
    return res.status(500).json({ error: 'Figma access token not configured' });
  }

  figmaAPI.defaults.headers.common['X-Figma-Token'] = figmaAccessToken;

  try {
    switch (method) {
      case 'GET':
        if (query.action === 'getFile') {
          const { fileKey } = query;
          const response = await figmaAPI.get(`/files/${fileKey}`);
          res.status(200).json(response.data);
        } else if (query.action === 'getNodeInfo') {
          const { fileKey, nodeId } = query;
          const response = await figmaAPI.get(`/files/${fileKey}/nodes?ids=${nodeId}`);
          res.status(200).json(response.data);
        } else {
          res.status(400).json({ error: 'Invalid action' });
        }
        break;

      default:
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('Figma API error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}