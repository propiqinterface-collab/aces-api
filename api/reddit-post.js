export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { clientId, clientSecret, username, password, subreddit, title, text } = req.body;

  // Get OAuth token
  const tokenRes = await fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'ACES/1.0 by ' + username,
    },
    body: `grant_type=password&username=${username}&password=${password}`,
  });

  const { access_token } = await tokenRes.json();

  // Submit post
  const postRes = await fetch('https://oauth.reddit.com/api/submit', {
    method: 'POST',
    headers: {
      Authorization: 'bearer ' + access_token,
      'User-Agent': 'ACES/1.0 by ' + username,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      api_type: 'json',
      kind: 'self',
      sr: subreddit,
      title,
      text,
    }).toString(),
  });

  const data = await postRes.json();
  res.json(data);
}

