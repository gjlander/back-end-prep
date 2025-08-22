import http from 'http';

// console.log(http);

const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');
    res.end(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <script src="https://cdn.tailwindcss.com"></script>
      <title>Document</title>
    </head>
    <body>
      <div class="container mx-auto p-4">
        <h1 class="text-2xl font-bold text-center">Here's a dog!</h1>
        <p class="text-center">This code came from a Node-powered server!</p>
        <img src="https://placedog.net/500/280" alt="Dog" class="mx-auto mt-4">
      </div>
    </body>
    </html>
    `);
});

const port = 3000;

server.listen(port, () =>
    console.log(`Server running at http://localhost:${port}/`)
);
