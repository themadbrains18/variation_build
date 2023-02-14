import React, { useEffect, useState } from "react";
import { EmptyState, Layout, Page, Grid, Card, Tabs, Columns, Tooltip, Text, Icon, Spinner, Label } from '@shopify/polaris';
import { ResourcePicker } from '@shopify/app-bridge-react';
import store from 'store-js';
import AddNewPairs from "../components/addpair";
import Image from "next/image";
import {
  EditMajor, DeleteMajor
} from '@shopify/polaris-icons';
import Link from "next/link";
import Swal from "sweetalert2";



import gql from 'graphql-tag'
import {
  SEARCH_PRODUCTS_BY_TITLE,
  SEARCH_PRODUCTS_BY_IDS,
  updateMetaFields,
} from '../libs/gql_query'
import client from "../config/client";
import { fieldProductHeading, fieldProductParagraph, fieldProductSwatch, fieldProductVariant } from "../libs/Field";
import { deleteMetafield } from "../libs/core";

const img = 'https://cdn.shopify.com/s/files/1/0757/9955/files/empty-state.svg';

const Index = () => {

 const [selected, setSelected] = useState(0)
 const [pairs,setPairs] = useState([])
 const [loader, setLoader] = useState(false)
  
 console.log('==========search=======')
 useEffect(() => {
    ;(async () =>{
      debugger;
      /// fetch saved record
      await fetch('/api/get-all-pair').then(function(response) {
        return response.json();
      }).then(function(data) {
        setPairs(data.data)
      });


    })().catch((err) =>{
      console.log(err)
    })

 },[]) 

  // const [selected, setSelected] = useState(0);

  const handleTabChange = (event) => {
    // console.log(event)
    this.setState({selected : event})
  }
 
 const deletePairfromData = async (id,pairData,actualdata) => {

  console.log('pairData : ', JSON.parse(pairData))


  Swal.fire({
    title: 'Do you want to delete?',
    showDenyButton: true,
    showCancelButton: true,
    confirmButtonText: 'Delete',
    denyButtonText: `Don't delete`,
  }).then(async (result) => {
    /* Read more about isConfirmed, isDenied below */
    if (result.isConfirmed) {
     

      //======================================================================//
      //======================================================================//
      //======================================================================//
      let overAllData = JSON.parse(actualdata)

      

      if('object' === typeof overAllData){
        let allData = [];
        console.log('actualdata : ',overAllData)

        overAllData?.forEach(async (elem, index) => {  
          console.log(elem.id,' elem.id')
            await deleteMetafield(elem.id)
        })
    
        setLoader(true)
            
           await fetch('/api/delete-pairs/' + id, {
              method: 'DELETE',
            })
            .then(res => res.json()) // or res.json()
            .then(res => {
              setPairs(res.data)
              setLoader(false)
    
            })
            .catch(err => console.log(err))
    
    
      }else{
        Swal.fire({
          title: 'Opps! 😊',
          text: 'Something went wrong please try again.',
          icon: 'warning',
        })
      }


      //======================================================================//
      //======================================================================//
      //======================================================================//


    } else if (result.isDenied) {
      Swal.fire('Changes are not saved', '', 'info')
    }
  })




 }
  
  const getP = () => {
    fetch('/api/fetchProduct')
    .then((response) => response.json())
    .then((data) => console.log(data));
      console.log(process.env.HOST)
    // /api/fetchProduct
  }

    return (
      <>
      <Grid gap={'xs'}>
      <div className={`overlayContainer ${loader ? 'active' : ''}`}> 
          <Spinner />  
      </div>

        { pairs.map((vl, key) => {
          const allP = JSON.parse(vl.pairdata)
          return <>
                  { (allP !== null) &&  <Grid.Cell  key={key} columnSpan={{xs: 6, sm: 3, md: 3, lg: 6, xl: 6}}>
                      <div className="main-edit-outer"> 
                      <Card title={vl.title} sectioned >
                          <div className="pair-edit"> 
                            <Link href={`/pairs/${vl.id}`}><Icon source={EditMajor} color="base" /></Link>
                            <a onClick={() => deletePairfromData(vl.id,vl.pairdata,vl.actualdata)} href="#"><Icon source={DeleteMajor} color="base" /></a>
                          </div>
                          <Columns>
                                { allP.map((cVL , cKEY) => {
                                      return (<>
                                      <Tooltip active content={cVL.title}>
                                        <Text variant="bodyMd" fontWeight="bold" as="span">
                                        <img key={`images-${cKEY}`} src={cVL?.images?.edges[0]?.node.originalSrc} height={50} width={50} alt={vl.title}  />
                                        </Text>
                                      </Tooltip>
                                      
                                        </>)
                                })}
                          </Columns>    
                        </Card>
                        </div>
                    </Grid.Cell>  }  
          </>
        })}

      
      </Grid>  
      { pairs.length === 0 &&
            <>
              <Layout>
                <Layout.Section>
                  <Card title="" sectioned>
                    
                      <h1 >Collection list empty</h1>
                  </Card>
                </Layout.Section>
              </Layout>
            </>
        }

     </>)
}
export default Index;