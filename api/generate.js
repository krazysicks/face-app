export default async function handler(req, res) {
  const random = Math.floor(Math.random() * 100000);

  return res.status(200).json({
    image: `https://picsum.photos/400?random=${random}`
  });
}
