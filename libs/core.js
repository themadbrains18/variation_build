import client from "../config/client";
import {
  SEARCH_PRODUCTS_BY_IDS,
  SEARCH_PRODUCTS_BY_TITLE,
  updateMetaFields,
} from "./gql_query";
import gql from "graphql-tag";

/**
 *
 * @param {*} query
 * @returns
 */

export const getExistingMetaField = async (id, query, metafields,heading,paragraph,ids) => {
  try {
    let saveValues = await client.query({
      query: gql`
        ${query}
      `,
    });
    
    console.log('save record ,,, ', saveValues)

    let ASUS = {}
    ASUS.pairdata = JSON.stringify(saveValues?.data?.nodes)
    ASUS.actualdata = JSON.stringify(metafields)

    if(heading != ''){
      ASUS.heading = heading
    }
    if(paragraph != ''){
      ASUS.paragraph = paragraph 
    }

    if(ids != ""){
      ASUS.ids = ids 
    }

    let updatedData = await fetch("/api/update-pairs/" + id, {
      method: "PUT",
      body: JSON.stringify(ASUS),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Success:", data);
        return data
      })
      .catch((error) => {
        console.error("Error:", error);
      });

      console.error('updatedData : ', updatedData) 

    return updatedData;
  } catch (error) {
    return [];
  }
};

/**
 * search product by keyword
 */

export const searchProduct = async (keyword) => {
  try {
    let products = await client.query({
      query: gql`
        ${SEARCH_PRODUCTS_BY_TITLE.replace("SEARCHTERM", keyword)}
      `,
    });
    return products;
  } catch (error) {
    return [];
  }
};

/**
 * search image files
 */

export const searchFiels = async (keyword) => {
  try {
    const res = await client.query({
      query: gql`
        ${keyword}
      `,
    });
    return res;
  } catch (error) {
    return {data : {files : { edges : []}}};
  }
};

/**
 *  addUpdateMetaFields in shopify store
 */

export const addUpdateMetaFields = async (allData) => {
  try {
    let res = await client.mutate({
      mutation: gql`
        ${updateMetaFields}
      `,
      variables: { metafields: allData },
    });
    return res;
    
  } catch (error) { 

    console.error(error)
    return [];
  }
};


/**
 * delete field from shopify 
 */

export const deleteMetafield = async (metaID) =>{
    try {
     const deleteRec =  await client.mutate({
      mutation : gql`
        mutation metafieldDelete($input: MetafieldDeleteInput!) {
          metafieldDelete(input : $input) {
            deletedId
            userErrors {
              field
              message
            }
          }
        }`,
        variables : {input:{id : metaID}}
      })
      return deleteRec;
    } catch (error) {
      console.error(error)
      return []
    }
}