require('isomorphic-fetch');
const dotenv = require('dotenv');
const Koa = require('koa');
const KoaRouter = require("koa-router");

const next = require('next');
const { default: createShopifyAuth } = require('@shopify/koa-shopify-auth');
const { verifyRequest } = require('@shopify/koa-shopify-auth');
const session = require('koa-session');
const {koaBody} = require("koa-body");
dotenv.config();


const { default: graphQLProxy } = require('@shopify/koa-shopify-graphql-proxy');
const { ApiVersion } = require('@shopify/koa-shopify-graphql-proxy');

const cors = require('@koa/cors');


const { default: db } = require('./models');
const { savePair, exitingRecord, getallpair, getsinglepair, updatepair,deletePair } = require('./controllers/actions');

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const { SHOPIFY_API_SECRET_KEY, SHOPIFY_API_KEY, API_VERSION, HOST , SHOPIFY_API_SCOPES,NODE_ENV } = process.env;
console.log(NODE_ENV,'========================')

const server = new Koa();
const router = KoaRouter();

// asdasdasd

server.use(cors({ origin: "*" }));


var products = [];


// save pair 

router.post("/api/save-pairs",koaBody(), savePair);
router.post("/api/existing",koaBody(), exitingRecord);
router.get("/api/get-all-pair",koaBody(), getallpair);
router.get("/api/get-single-pair/:slug",koaBody(), getsinglepair);
router.put("/api/update-pairs/:slug",koaBody(), updatepair);
router.delete("/api/delete-pairs/:slug",koaBody(), deletePair);









// Fetch store products
router.get("/api/fetchProduct",koaBody(), async (ctx) => {
  
  const { shop, accessToken } = ctx.session;
  console.log(shop,accessToken,'================',ctx) 

  if (shop && accessToken) {
    const productUrl = `https://${shop}/admin/api/2020-04/products.json`;
    console.log(productUrl);

    const productResponse = await fetch(productUrl, {
      method: "get",
      headers: {
        "X-Shopify-Access-Token": accessToken,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    const productResponseBody = await productResponse.json();
    console.log('Store details', productResponseBody); 

    try {
      ctx.body = {
        status: "success",
        data: products,
      };
    } catch (error) {
      console.log(error);
    }
  } else {
    ctx.body = {
      status: 500,
      message: "Invalid access",
    };
  }
});

// Router Middleware
server.use(router.allowedMethods());
server.use(router.routes());


app.prepare().then(() => {


  server.use(session({ secure: true, sameSite: 'none' }, server));
  server.keys = [SHOPIFY_API_SECRET_KEY];

  server.use(
    createShopifyAuth({
      apiKey: SHOPIFY_API_KEY,
      secret: SHOPIFY_API_SECRET_KEY,
      scopes: SHOPIFY_API_SCOPES.split(','),
      async afterAuth(ctx) {
        const { shop, accessToken } = ctx.state.shopify;
        console.log(ctx);

        const returnUrl = `${HOST}?shop=${shop}`;
        // const subscriptionUrl = await getSubscriptionUrl(accessToken, shop, returnUrl);
        // ctx.redirect(subscriptionUrl);
      },

    }),
  );


  server.use(graphQLProxy({version: '2022-10'})) 
  server.use(verifyRequest());
  server.use(async (ctx) => {
    await handle(ctx.req, ctx.res);
    ctx.respond = false;
    ctx.res.statusCode = 200;
    return
  });
  
  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });






});