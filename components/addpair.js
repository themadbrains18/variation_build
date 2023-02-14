import React, { use, useEffect, useState } from 'react'
import gql from 'graphql-tag'
import {Card,Stack,TextStyle,ResourceItem,Grid,Form,FormLayout,Placeholder,Checkbox,Button,TextField,IndexTable,useIndexResourceState,Text,Spinner,PageActions,Columns,Thumbnail,
} from '@shopify/polaris'
import Swal from 'sweetalert2'
import styles from '../styles/main.module.css'
import {
  SEARCH_PRODUCTS_BY_TITLE,
  SEARCH_PRODUCTS_BY_IDS,
  updateMetaFields,
} from '../libs/gql_query'

import * as PropTypes from 'prop-types'
import GalleryModal from './galleryPopup'
import client from '../config/client'
import { fieldProductGridImage, fieldProductHeading, fieldProductParagraph, fieldProductSeenIn, fieldProductSwatch, fieldProductVariant } from '../libs/Field'
import { addUpdateMetaFields, getExistingMetaField, searchProduct } from '../libs/core'


const AddNewPairs = () => {

  const [search, setSearch] = useState('')
  const [product, setProduct] = useState([])
  const [loader, setLoader] = useState(false)
  const [p_loader, setPLoader] = useState(false)
  const [modalController, setModalController] = useState(false)
  const [imageFor, setImageFor] = useState(-1)
  const [variant, setVariant] = useState('')
  const [selectedProduct, setSelectedProduct] = useState([])
  const [selectedThumbs, setSelectedThumbs] = useState([])

  const [selectedDiv,setSelectedDiv] = useState([])


  //* metafield value**/
  
  const [paragraph, setParagraph] = useState('')
  const [heading, setHeading] = useState('')
  const [collection_title, setCollection] = useState('')
  const [imageRecognition, setRecognition] = useState('')
  const [gridImage, setGridImage] = useState([])
  const [seenIn, setSeenIn] = useState([])




  // get existing record

  const [existing, setExisting] = useState()

  useEffect(() => {
    ;(async () => {
      /***************************************************************/
      // Search Query
      /***************************************************************/
      if (search !== '') {
         const res = await searchProduct(search);
         setLoader(false)
         setProduct(res.data.products.edges)
      }else{
        setProduct([])
      }

    })().catch((error) => {
      console.log('Error data here... ',error)
    })
  }, [search])

  function paginate(array, page_size, page_number) {
    // human-readable page numbers usually start with 1, so we reduce 1 in the first argument
    return array.slice((page_number - 1) * page_size, page_number * page_size);
  }

  const  containsUndefined = (arr) => {
    return arr.includes(undefined);
  }


  const merge = (first, second) => {
    for(let i=0; i<second.length; i++) {
      first.push(second[i]);
    }
    return first;
  }


  const savepairs = async () => {
  
    if((selectedThumbs.length === selectedProduct.length) && collection_title != ''){

      let images = ''
      selectedThumbs.forEach((Imgelem, index) => {
        images += ` ${Imgelem.image.originalSrc.split('/').pop().split('?')[0]}`;
      })

      let pvarient = '';
      let ids = ''
      selectedProduct.forEach((pv, pvindex) => {
        
        pvarient += `/products/${pv.handle} `;
        ids += `${pv.id} `;
      })

      

       /// collect all data
     let AllData = []
     selectedProduct.forEach((elem, index) => {
     
      /************************************/ // variant
      let veriant = fieldProductVariant(elem.id,pvarient.trim())
      
      /**********************************/ // swatches
      let swatches = fieldProductSwatch(elem.id,images.trim())
      AllData.push(veriant,swatches)

      /**********************************/ // heading
      if(heading != '') {
        let pHeding = fieldProductHeading(elem.id,heading.trim())
        AllData.push(pHeding)
      }
      /**********************************/ // paragraph
      if(paragraph !=''){
        let pParagraph = fieldProductParagraph(elem.id,paragraph.trim())
        AllData.push(pParagraph)
      }

      /**********************************/ // grid images
      if(gridImage.length > 0){
        let gridImg = fieldProductGridImage(elem.id,gridImage[0]?.id)
        AllData.push(gridImg)
      }
      /**********************************/ // seenIn
      if(seenIn.length > 0){
        let seenInString = []
        seenIn.map((sn) => {
          seenInString.push(sn.id)
        })
        let seenIns = fieldProductSeenIn(elem.id,JSON.stringify(seenInString))
        AllData.push(seenIns)
      }

     }) 


    //  

    

    setLoader(true)
    
    await fetch("/api/save-pairs",{
      method : "POST", 
      body : JSON.stringify({ids : ids, pairdata : selectedProduct, actualdata : AllData, heading : heading, paragraph : paragraph, title : collection_title  })
    }) 
    .then((response) => response.json())
    .then(async (res) => {


      /**************************************************** */
      // multiple request handled 
      /**************************************************** */
      let addData = []
      if((AllData.length/25) > 1){
        let totalLength = AllData.length/25
        for await (const x of Array(Math.ceil(totalLength)).keys()) {
          let updatedRecord = await addUpdateMetaFields(paginate(AllData,25,(x+1)))
          let repeatRecord = updatedRecord?.data?.metafieldsSet?.metafields;
          merge(addData,repeatRecord)
        }
      }else{
        let updatedRecord = await addUpdateMetaFields(AllData)
        addData = updatedRecord?.data?.metafieldsSet?.metafields;
      }
     /**************************************************** */
     // multiple request handled
     /**************************************************** */
      console.log(AllData);
      
      AllData.map((mp,keymp) =>{
        addData[keymp].ownerId = mp.ownerId
      });


      // restProduct()

      let iii =  await getExistingMetaField(res.data.id,SEARCH_PRODUCTS_BY_IDS(selectedProduct), addData, heading, paragraph)
      setLoader(false)


      Swal.fire({  
        title: 'Good job! 😊',  
        text: 'Field updated successfully !',
        icon: 'success'
      }); 


    })
    .catch((error) => {
      setLoader(false)

      Swal.fire({  
        title: 'Something went wrong 😊',  
        text: 'Please recheck and try again!',
        icon: 'warning'
      }); 
      
    });

    }else{
         Swal.fire({  
            title: 'Opps! something went wrong.👻',  
            text: 'Collection Title / Swatches are mandatory...',
            icon: 'warning'
          }); 
    }
  }

  const restProduct = () => {
    setSelectedDiv([])
    setSelectedProduct([])
    setSelectedThumbs([])
    setParagraph('')
    setHeading('')
    setCollection('')
    setGridImage([])
    setSeenIn([])
  }

  // select product

  const select_product = async (e,Itemdata,id) => {
    id = id.join('');

    await fetch('/api/existing',{
      method : "POST",
      body   : JSON.stringify(Itemdata)
    })
    .then((response) => response.json()) 
    .then(async (data) => {
      if(data.status === 200){
         if(data.data === null){


          //=================================================================================//
          // 
          //=================================================================================//

          setSelectedProduct(pre => { return [...pre,Itemdata]})
          let counter = 1;
          await selectedProduct.map(async (ele, ind) => {
              if(ele.id.match(/\d/g).join("") === id) {
                counter++;
                if(counter > 1){
                  let newV = await selectedProduct.filter((e) => { return e.id.match(/\d/g).join("") !== id})
                  setSelectedProduct(newV)
                }
              }
          })


          //=================================================================================//
          // 
          //=================================================================================//

          setSelectedDiv(pre => { return [...pre,id]})

          await selectedDiv.map(async (ele, ind) => {
              if(ele === id) {
                let newD = await selectedDiv.filter((e) => { return e !== id})
                setSelectedDiv(newD)
              }
          })


         }else{
            // duplicate
            Swal.fire({  
              title: 'Product already associated with other pair.👻',  
              text: 'Please assign swatches to selected products!',
              icon: 'warning'
            }); 
         }
      }

    })
    .catch((error) => {
      console.error('Error:', error);
    });



    
  }



  // clearData

  const clearData = () => {
    setSelectedProduct([])
    setSelectedDiv([])
  }

  //=====================================================//
  ///
  //=====================================================//

  const handleChange = (event,index) => {
      setRecognition('swatch');
      if(index === undefined)  //  if index return undefine then set -1 
        setImageFor(-1)
      else
        setImageFor(index)
      setModalController(!modalController)
  }

  const selectGridImage = () =>{
    setRecognition('grid');
    setModalController(!modalController)
  }
  const asseenin = () =>{
    setRecognition('seen');
    setModalController(!modalController)
  }


  const selectImages = (key, img) => {
    if(imageRecognition == 'swatch'){
      selectedThumbs[key] = img
    }else if(imageRecognition == 'grid'){
      setGridImage([img])
    }else if(imageRecognition == 'seen'){
      setSeenIn(old => [...old,img])
    }
  }

 


  return (
    <>
    
    <div className={`overlayContainer ${loader ? 'active' : ''}`}> 
      <Spinner />
    </div>

    <Grid>
      <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}>
        <Card title="Seach Product" sectioned>
        <Form 
            // onSubmit={handleSubmit}
            >
            <FormLayout>
              <TextField
                onChange={(e) => setSearch(e)}
                label=""
                type="text"
                value={search}
                helpText={
                  <span>
                    &nbsp;
                  </span>
                }
              />

            </FormLayout>  
         </Form>

{/*  */}
{/*  */}
{/*  */}
{/*  */}
      <Grid>
       { product.map((elements , index)=>{
         return (
                <Grid.Cell key={'product-s-'+index} columnSpan={{xs: 4, sm: 4, md: 4, lg: 4, xl: 4}}> 
                  <div onClick={(e) => select_product(e,elements.node,elements.node?.id.match(/\d/g))}  className={`tmb_grid ${(selectedDiv.includes(elements.node?.id.match(/\d/g).join(""))) ? 'activeClass' : '' }`}>
                    <Card title={elements.node.title} sectioned >
                        <img src={elements.node?.images?.edges[0]?.node.originalSrc} height="90px" />
                    </Card>
                  </div>
                </Grid.Cell> 
         )})
       }
      </Grid>
{/*  */}
{/*  */}
{/*  */}
{/*  */}


        </Card>
      </Grid.Cell>

      <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}>
        <Card title="Selected Product" sectioned>
            {/* <button onClick={clearData} >Clear selected</button> */}


            <Grid>
            { selectedProduct.length > 0 && 
                  <>
                    <Grid.Cell columnSpan={{xs: 12, sm: 12, md: 12, lg: 12, xl: 12}}>
                    <TextField 
                      name='collectiontitle' 
                      type='text' 
                      placeholder='Add title'
                      label="Collection Title"
                      onChange={(e) => setCollection(e)}
                      value={collection_title}
                     />
                    </Grid.Cell>

                    <Grid.Cell columnSpan={{xs: 12, sm: 12, md: 12, lg: 12, xl: 12}}>
                      <TextField
                        label="Product Grid Paragraph"
                        multiline={4}
                        autoComplete="off"
                        onChange={(e) => setParagraph(e)}
                        value={paragraph}
                      />

                      

                    </Grid.Cell>

                    <Grid.Cell columnSpan={{xs: 12, sm: 12, md: 12, lg: 12, xl: 12}}>
                    <TextField 
                          name='collectiontitle' 
                          type='text'
                          placeholder='Add title'
                          label="Product Grid Heading"
                          onChange={(e) => setHeading(e)}
                          value={heading}
                    />
                    </Grid.Cell>

                    <Grid.Cell columnSpan={{xs: 12, sm: 12, md: 12, lg: 12, xl: 12}}>
                        <Button onClick={selectGridImage}>Product Grid Image</Button>
                        {(gridImage.length > 0) && <>
                            <img src={gridImage[0]?.image?.originalSrc} width={60} />
                        </>}
                    </Grid.Cell>

                    <Grid.Cell columnSpan={{xs: 12, sm: 12, md: 12, lg: 12, xl: 12}}>
                      <Button onClick={asseenin}>Seen in</Button>
                      {
                        (seenIn.length > 0) && 
                          seenIn.map((imges, imageKey) => {
                            return <>
                              <img src={imges?.image?.originalSrc} width={60} />
                            </>
                          })
                      }
                    </Grid.Cell>

                  </>
            }
           
           
            {
              
            selectedProduct.map((val, key) => {
             return (<> 
                  

                  <Grid.Cell key={`sl_${key}`} columnSpan={{xs: 4, sm: 4, md: 4, lg: 4, xl: 4}}>
                      <Card title={val.title} sectioned >
                        <img src={val?.images?.edges[0]?.node.originalSrc} height="90px" />
                        { (selectedThumbs[key] !== undefined) &&
                        <>
                          <img src={selectedThumbs[key]?.image?.originalSrc} height="90px" />
                        </>
                        }
                        <button  onClick={(e) => handleChange(e,key)}>{ (selectedThumbs[key]?.image?.originalSrc !== undefined) ? 'Change' : 'Add'}</button>
                        
                      </Card>
                      
                  </Grid.Cell>
               
              </>)
})
          }
               </Grid>

               { (selectedProduct.length > 0) && (<PageActions
                  primaryAction={{
                    content: 'Save',
                    onAction : savepairs
                  }}
                  secondaryActions={[
                    {
                      content: 'Cancel',
                      destructive: true,
                      onAction : restProduct
                    },
                  ]}
                />
                ) 
              }
        </Card>
        </Grid.Cell>
    </Grid>
     <GalleryModal active={modalController} handleChange={handleChange} selectImages={selectImages} imageFor={imageFor} />
     </>
  )
}
export default AddNewPairs
