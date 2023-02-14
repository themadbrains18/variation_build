
# Setup the Shopify app.

1. Initialize the directory for Node.js with a package.json.

```bash
  npm init -y
```

2. Install React and Next.js

```bash
  npm install --save react react-dom next
```

3. Create a pages directory in the app project directory

```bash
  npm install --save react react-dom next
```
4. mkdir pages





## Install the Shopify App

In a new terminal window, install ngrok:

```bash
  npm install ngrok -g
```

```bash
  ngrok http 3000
```

Put ngrok url in Shopify partner under app setup settings

[![MIT License](https://global-uploads.webflow.com/5fefd2536e57827d17712176/5ff0f44a92fcdb6620db551d_shopify-setup-app.png)](https://choosealicense.com/licenses/mit/)


5. Create a .env in your project folder with the following contents. 


```bash
SHOPIFY_API_KEY='0eb98482663a5c2b60f260bde05fe93b'
SHOPIFY_API_SECRET_KEY='<copy in api secret key>'
```

```bash
$ npm install --save koa @shopify/koa-shopify-auth dotenv koa-session isomorphic-fetch
```

6. Create a server.js that starts Node.js

```bash
require('isomorphic-fetch');
const Koa = require('koa');
const next = require('next');
const { default: createShopifyAuth } = require('@shopify/koa-shopify-auth');
const dotenv = require('dotenv');
const { verifyRequest } = require('@shopify/koa-shopify-auth');
const session = require('koa-session');

dotenv.config();

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const { SHOPIFY_API_SECRET_KEY, SHOPIFY_API_KEY } = process.env;

app.prepare().then(() => {
  const server = new Koa();
  server.use(session({ sameSite: 'none', secure: true }, server));
  server.keys = [SHOPIFY_API_SECRET_KEY];

  server.use(
    createShopifyAuth({
      apiKey: SHOPIFY_API_KEY,
      secret: SHOPIFY_API_SECRET_KEY,
      scopes: ['read_products'],
      afterAuth(ctx) {
        const { shop, accessToken } = ctx.session;

        ctx.redirect('/');
      },
    }),
  );

  server.use(verifyRequest());
  server.use(async (ctx) => {
    await handle(ctx.req, ctx.res);
    ctx.respond = false;
    ctx.res.statusCode = 200;

  });

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
```

7. Update the scripts section of package.json to run the Shopify app:

```bash
"scripts": {
  "test": "echo \"Error: no test specified\" && exit 1",
  "dev": "node server.js",
  "build": "next build",
  "start": "NODE_ENV=production node server.js"
},
```

Then restart server ``` npm run dev ```

8. In the Shopify partner dashboard, click the Select store inside Test your app. Then click Create new store.

## Work on the user interface

Shopify uses a design system they created called `Polaris` it serves as an opinionated UI/UX framework. Polaris makes it easy and fast to develop user interfaces the framework is very opinionated.

1. Install Polaris in your project directory:

`npm install --save @shopify/polaris`

2. Add the Polaris package into your Next `_app.js` configuration:

```
import App from 'next/app';
import Head from 'next/head';
import { AppProvider } from '@shopify/polaris';
import '@shopify/polaris/dist/styles.css';
import translations from '@shopify/polaris/locales/en.json';

class MyApp extends App {
  render() {
    const { Component, pageProps } = this.props;
    return (
      <React.Fragment>
        <Head>
          <title>Sample App</title>
          <meta charSet="utf-8" />
        </Head>
        <AppProvider i18n={translations}>
          <Component {...pageProps} />
        </AppProvider>
      </React.Fragment>
    );
  }
}

export default MyApp;
```

3. Updates pages/index.js to use Polaris elements:

``` 
import React from "react";
import { EmptyState, Layout, Page } from '@shopify/polaris';

const img = 'https://cdn.shopify.com/s/files/1/0757/9955/files/empty-state.svg';

const Index = () => (
  <Page>
    <Layout>
      <EmptyState
        heading="Discount your products temporarily"
        action={{
          content: 'Select products',
          onAction: () => console.log('clicked'),
        }}
        image={img}
      >
        <p>Select products to change their price temporarily.</p>
      </EmptyState>
    </Layout>
  </Page>
);

export default Index; 
```


[embed]https://drive.google.com/file/d/1SYx7zIkEUQoIAj4ayKSJ5baJAbHMgLft/view?usp=share_link[/embed]
