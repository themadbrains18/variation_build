import React, {useState, useCallback} from "react";
import App from "next/app";
import Head from "next/head";
import Link from "next/link";
import { AppProvider , Page, Grid, Card,    Tabs } from "@shopify/polaris";
// import '@shopify/polaris/dist/styles.css';
// import '@shopify/polaris/styles.css';
import {HomeMinor, OrdersMinor, ProductsMinor} from '@shopify/polaris-icons';


import { Provider } from "@shopify/app-bridge-react";
import style from "../styles/common.css";
import translations from "@shopify/polaris/locales/en.json";
import ClientRouter from "../components/ClientRouter";

import ApolloClient from "apollo-boost";
import { ApolloProvider } from "react-apollo";
import Cookies from "js-cookie";
import { InMemoryCache } from "apollo-boost";


const client = new ApolloClient({
  fetchOptions: {
    credentials: "include",
  },
  cache: new InMemoryCache(),
});

class MyApp extends App {
  
  render() {
    const { Component, pageProps } = this.props;
    //   const config = { apiKey: API_KEY, shopOrigin: Cookies.get("shopOrigin"), forceRedirect: true };

    const config = {
      apiKey: API_KEY,
      shopOrigin: Cookies.get("shopOrigin"),
      forceRedirect: true,
      host: Buffer.from("pankajtmb.myshopify.com").toString("base64"),
    };
    
    
    return (
      <React.Fragment>
        <Head>
          <title>Sample App</title>
          <meta charSet="utf-8" />
          <link rel="stylesheet" href="https://unpkg.com/@shopify/polaris@10.16.1/build/esm/styles.css" />
        </Head>
        <div className="tmb_stack">
          <Provider config={config}>
            <ClientRouter />
            <AppProvider>
              <ApolloProvider client={client}>
                 <ul className="tabList">
                   <li className="tabItem">
                      <Link href="/"  className="tabLink">All</Link>
                    </li>
                   <li className="tabItem">
                      <Link href="/create-pair" className="tabLink">Create New Pair</Link>
                    </li>
                 </ul>
                 <div className="main_content">
                  <Component {...pageProps} />
                </div>
              </ApolloProvider>
            </AppProvider>
          </Provider>
        </div>
      </React.Fragment>
    );
  }
}

export default MyApp;
