import React from "react";
import { EmptyState, Layout, Page, Grid, Card, Tabs } from '@shopify/polaris';
import { ResourcePicker } from '@shopify/app-bridge-react';
import store from 'store-js';
import AddNewPairs from "../components/addpair";


const img = 'https://cdn.shopify.com/s/files/1/0757/9955/files/empty-state.svg';

const Index = () =>  {

    return (
      <>
       <AddNewPairs />
     </>
    );
  

}

export default Index;