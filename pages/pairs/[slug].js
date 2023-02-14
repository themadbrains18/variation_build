import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import {
  EmptyState,
  Layout,
  Page,
  Grid,
  Card,
  Tabs,
  Columns,
  Button,
  Tooltip,
  Text,
  Icon,
  Spinner,
  Form,
  FormLayout,
  PageActions,
  TextField,
} from '@shopify/polaris'
import Link from 'next/link'
import { EditMajor, DeleteMajor, AddMajor } from '@shopify/polaris-icons'
import Swal from 'sweetalert2'

import gql from 'graphql-tag'
import client from '../../config/client'
import { addUpdateMetaFields, deleteMetafield, searchProduct, getExistingMetaField } from '../../libs/core'


import {
  SEARCH_PRODUCTS_BY_TITLE,
  SEARCH_PRODUCTS_BY_IDS,
  updateMetaFields,
} from '../../libs/gql_query'
import GalleryModal from '../../components/galleryPopup'

import { fieldProductGridImage, fieldProductHeading, fieldProductParagraph, fieldProductSeenIn, fieldProductSwatch, fieldProductVariant } from '../../libs/Field'


const Index = () => {
  //   const [pairInfo, setPairInfo] = useState([]);
  const [pairs, setPairs] = useState([])
  const [search, setSearch] = useState('')
  const [product, setProduct] = useState([])
  const [selectedDiv, setSelectedDiv] = useState('')
  const [loader, setLoader] = useState(false)
  const [finalScreen, setFinalScreen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState([])
  const [selectedRough, setSelectedRough] = useState([]) // product rough

  const [addproductshowArea, setAddProductShowArea] = useState(false)
  const [selectedThumbs, setSelectedThumbs] = useState([])
  const [modalController, setModalController] = useState(false)
  const [imageFor, setImageFor] = useState(-1)

  // editUpadte
  const [editUpdata, setEditUpdate] = useState(false)
  const [indexUpdata, setIndexUpdate] = useState(-1)

  // new fields
  const [paragraph, setParagraph] = useState('')
  const [heading, setHeading] = useState('')
  const [imageRecognition, setRecognition] = useState('')
  const [gridImage, setGridImage] = useState([])
  const [seenIn, setSeenIn] = useState([])
  const [seenInpre, setSeenInpre] = useState([])

  //* metafield value**/
  


  useEffect(() => {
    ;(async () => {
      if (search !== '') {
        const res = await searchProduct(search)
        setProduct(res.data.products.edges)
      } else {
        setProduct([])
      }
    })().catch((error) => {
      console.log('error : ', error)
    })
  }, [search])

  const { slug } = useRouter().query

  useEffect(() => {
    ;(async () => {
      await fetch(`/api/get-single-pair/${slug}`)
        .then((response) => response.json())
        .then((data) => {
          setPairs([data.data])
        })
        .catch((error) => {
          console.error('Error:', error)
        })
    })().catch((error) => {
      console.log(error)
    })
  }, [])

  //=====================================================//
  //
  //=====================================================//

  function paginate(array, page_size, page_number) {
    // human-readable page numbers usually start with 1, so we reduce 1 in the first argument
    return array.slice((page_number - 1) * page_size, page_number * page_size);
  }
  const merge = (first, second) => {
    for(let i=0; i<second.length; i++) {
      first.push(second[i]);
    }
    return first;
  }

  const deleteAction = async (e, index, handle, wholeData) => {

    try {
      
    
    let deleteRequest = JSON.parse(pairs[0]?.pairdata) 
    let deleteActualdata = JSON.parse(pairs[0]?.actualdata)

    if (typeof deleteRequest === 'object') {
       setLoader(true)
      console.log('deleteActualdata ::::: ', deleteActualdata)
      let productVariant = deleteActualdata[0]?.value.split(' ',)
      let productSwatch = deleteActualdata[1]?.value.split(' ')
      let productHeading = deleteActualdata[2]?.value;
      let productParagraph = deleteActualdata[3]?.value;
      let productGridImage = deleteActualdata[4]?.value;
      let productSeenIn = deleteActualdata[5]?.value;
      
      console.log('deleteRequest : ',deleteRequest)
      console.log('productSwatch : ',productSwatch)
      console.log('productVariant : ',productVariant)

      //===========================================//
      // delete all pair
      //===========================================//
      
      let beforeDelete = deleteRequest[index]

      let collectDeleteID = [];
      deleteActualdata?.map((deleteRQ, deleteIndex) => {
        if(beforeDelete.id == deleteRQ.ownerId){
          collectDeleteID.push(deleteRQ.id)
        }
      })


      delete productVariant[index]
      delete productSwatch[index]
      await delete deleteRequest[index]
      await delete wholeData[index]

      var wholeData = wholeData.filter(function (el) {
        return el != null
      })

      //===========================================//
      // delete pair
      //===========================================//

      productVariant = productVariant.join(' ').trim()
      productSwatch = productSwatch.join(' ').trim()

      console.log(deleteRequest)
      /// collect all data
      let AllData = []
     
      let id = [];
      deleteRequest.forEach((elem, index) => {
        id.push(elem.id)
        let veriant = fieldProductVariant(elem.id,productVariant.replace(/  +/g, ' '))
        let swatches = fieldProductSwatch(elem.id,productSwatch.replace(/  +/g, ' '))
        let pHeding = fieldProductHeading(elem.id,productHeading.trim())
        let pParagraph = fieldProductParagraph(elem.id,productParagraph.trim())
        let gridImg = fieldProductGridImage(elem.id,productGridImage.trim())
        let seenIns = fieldProductSeenIn(elem.id,productSeenIn.trim())
        AllData.push(veriant,swatches,pHeding,pParagraph,gridImg,seenIns)
      })


      //=======================================//
      // first update exsting record
      //=======================================//

      
      /************************************************** */
        // multiple request manage 
      /************************************************** */    
      let addData = []
      if((AllData.length/25) > 1){
        let totalLength = AllData.length/25
        for await (const x of Array(Math.ceil(totalLength)).keys()) {
          console.log(paginate(AllData,25,(x+1)))
          let updatedRecord = await addUpdateMetaFields(paginate(AllData,25,(x+1)))
          let repeatRecord = updatedRecord?.data?.metafieldsSet?.metafields;0
          merge(addData,repeatRecord) 
        }
      }else{
        let updatedRecord = await addUpdateMetaFields(AllData)
        addData = updatedRecord?.data?.metafieldsSet?.metafields;
      }
      /************************************************** */
      //multiple request manage 
      /************************************************** */

      AllData.map((mp,keymp) =>{
        addData[keymp].ownerId = mp.ownerId
      });
  

      collectDeleteID?.map(async (deleteID,deleteIDIndex) => {
        console.log('deleteID ===  : '+deleteIDIndex+' ',deleteID)

        let deleAprove = await deleteMetafield(deleteID)
        console.log('deleAprove : '+deleteIDIndex+' ',deleAprove)
      })


      let iii =  await getExistingMetaField(slug,SEARCH_PRODUCTS_BY_IDS(wholeData), addData,heading,paragraph,id.join(" "))

      setLoader(false)
      console.log('Success:', iii)
      console.log('new Pairs : ', iii?.data)
      setPairs([iii?.data])

    } else {
      Swal.fire({
        title: 'Opps! something wen wrong!😊',
        icon: 'warning',
      })
    }

    } catch (error) {
       Swal.fire({
        title: 'Opps! something wen wrong!😊',
        icon: 'warning',
      })
    }

  }

  

  const add_product_showArea = (index) => {
    // console.log(index, " : index")
    // return
    setAddProductShowArea((prev) => !prev)
    setEditUpdate(false)
    setIndexUpdate(-1)
    setSelectedProduct([])
    setFinalScreen(false)


    setParagraph('')
    setHeading('')
    setGridImage('')
    setSeenIn([])
    setSeenInpre([])
  }

  /********************************************************************/
  /********************************************************************/
  /********************************************************************/


  const select_product = async (e, Itemdata, id) => {
    id = id.join('')
    setSelectedDiv(id)
    setSelectedRough(Itemdata)
    setSelectedProduct([Itemdata])

    await fetch('/api/existing', {
      method: 'POST',
      body: JSON.stringify(Itemdata),
    })
      .then((response) => response.json())
      .then(async (data) => {
        if (data.status === 200) {
          if (data.data === null) {
             // hide search area 
             setAddProductShowArea(false)
             setFinalScreen(true)
          } else {
            // duplicate
            Swal.fire({
              title: 'Product already associated with other pair.👻',
              text: 'Please assign swatches to selected products!',
              icon: 'warning',
            })
          }
        }
      })
      .catch((error) => {
        console.error('Error:', error)
      })
  }


  /********************************************************************/
  /********************************************************************/
  /********************************************************************/

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
      if(seenInpre.length > 0){
        setSeenIn([])
        setSeenInpre([])
      }
      setSeenIn(old => [...old,img])
    }
  }

  /********************************************************************/
  /********************************************************************/
  /********************************************************************/






  /********************************************************************/
  /************************Save and reset pairs ***********************/
  /********************************************************************/

   console.log(' add_product_showArea :' , indexUpdata)
  const editAction = async (e, index, handle, wholeData) => {

    console.log(wholeData[index])


    setFinalScreen(true)
    setAddProductShowArea(false)
    setIndexUpdate(index)
    setSelectedProduct([wholeData[index]])
    setEditUpdate(true)
    setSelectedThumbs([])

    console.log('pair data,',pairs)
    setParagraph(pairs[0]?.paragraph)
    setHeading(pairs[0]?.heading)
    setGridImage([{id:wholeData[index]?.product_grid_image?.value}])

    if(wholeData[index]?.seen_in?.value != "" && wholeData[index]?.seen_in?.value != undefined){

      console.log(wholeData[index]?.seen_in?.value, ' wholeData[index]?.seen_in?.value')

        let formattoSeenIn = []
        JSON.parse(wholeData[index]?.seen_in?.value).map((formatSeen,formatSeenIndex) => {
          formattoSeenIn.push({id : formatSeen})
        })
        setSeenIn(formattoSeenIn)
        setSeenInpre(formattoSeenIn)
    }

  }

  console.log(seenIn,' :::: setSeenIn')

  const updatePairs = async () => {
      
      setLoader(true)
      let images = ''
      let pvarient = '';
      let ids = ''

     
      

      let existingData = JSON.parse(pairs[0]?.pairdata);

      if(typeof existingData === 'object' && Math.sign(indexUpdata) !== -1){

          let actualData = JSON.parse(pairs[0]?.actualdata);

          let productVr =  actualData[0]?.value
          let sw =  actualData[1]?.value

          if(selectedThumbs.length > 0){
            selectedThumbs.forEach((Imgelem, index) => {
              images += ` ${Imgelem.image.originalSrc.split('/').pop().split('?')[0]}`;
            })
    
            selectedProduct.forEach((pv, pvindex) => {
              pvarient += `/products/${pv.handle} `;
            })

             productVr =  actualData[0]?.value
            let productSw =  actualData[1]?.value.split(" ")
  
            productSw[indexUpdata] = images;
            sw = productSw.join(" ").trim(" ")

          }
          
          selectedProduct.forEach((pv, pvindex) => {
            ids += `${pv.id} `;
          })

          await updateDataShopifyAndDatabase(existingData,productVr,sw,'')
          // setIndexUpdate(-1)
          setLoader(false)
      }else{
        Swal.fire({  
          title: 'Opps! something went wrong.👻',  
          text: 'Please assign swatches to selected products!',
          icon: 'warning'
        }); 
      }

  }


  const updateDataShopifyAndDatabase = async (mergeData,newVaiant,newSwatch, ids='') => {


    let AllData = []

    let oldIds = ''
    mergeData.forEach((elem, index) => {
     oldIds += elem.id;
      
      /************************************/ // variant
      if(newVaiant !== ''){
        let veriant = fieldProductVariant(elem.id,newVaiant.trim())
        console.log('fieldProductVariant : ',veriant)
        AllData.push(veriant)
      }
      /**********************************/ // swatches
      if(newSwatch !== ''){
        let swatches = fieldProductSwatch(elem.id,newSwatch.trim())
        AllData.push(swatches)
      }

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
        let unique = [...new Set(seenInString)];
        let seenIns = fieldProductSeenIn(elem.id,JSON.stringify(unique))
        AllData.push(seenIns)
      }
    }) 

    console.log('AllData : ',AllData)

    try {
      // let updatedRecord = await addUpdateMetaFields(AllData)
      // let addData = updatedRecord?.data?.metafieldsSet?.metafields;

       /************************************************** */
        // multiple request manage 
      /************************************************** */    
      let addData = []
      if((AllData.length/25) > 1){
        let totalLength = AllData.length/25
        for await (const x of Array(Math.ceil(totalLength)).keys()) {
          console.log(paginate(AllData,25,(x+1)))
          let updatedRecord = await addUpdateMetaFields(paginate(AllData,25,(x+1)))
          let repeatRecord = updatedRecord?.data?.metafieldsSet?.metafields;0
          merge(addData,repeatRecord) 
        }
      }else{
        let updatedRecord = await addUpdateMetaFields(AllData)
        addData = updatedRecord?.data?.metafieldsSet?.metafields;
      }
      /************************************************** */
      //multiple request manage 
      /************************************************** */

      AllData.map((mp,keymp) =>{
        addData[keymp].ownerId = mp.ownerId
      });

      let iii =  await getExistingMetaField(slug,SEARCH_PRODUCTS_BY_IDS(mergeData), addData, heading, paragraph,oldIds)
      console.log('iii update => ', iii)
      setPairs([iii?.data])

      setLoader(false)
      restProduct()

      Swal.fire({  
        title: 'Good job! 😊',  
        text: 'Field updated successfully !',
        icon: 'success'
      });


    } catch (error) {
      Swal.fire({  
        title: 'Something went wrong 😊',  
        text: 'Please recheck and try again!'.error,
        icon: 'warning'
      }); 
    }
   
  } 

  const savepairs = async () => {
    
    if((selectedThumbs.length === selectedProduct.length)){
      setLoader(true)

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


      let mergeData = JSON.parse(pairs[0]?.pairdata);
      let actualdata = JSON.parse(pairs[0]?.actualdata);

      
      
      let newVaiant = actualdata[0]?.value+' '+pvarient
      let newSwatch = actualdata[1]?.value+''+images


      mergeData.push(selectedRough)

      // update data in shopify also database 

      await updateDataShopifyAndDatabase(mergeData,newVaiant,newSwatch,ids)


    }else{
      Swal.fire({  
         title: 'Opps! something went wrong.👻',  
         text: 'Please assign swatches to selected products!',
         icon: 'warning'
       }); 
    }
  }
  const restProduct = () => {
    setAddProductShowArea(true);
    setSelectedProduct([])
    setSelectedThumbs([])
    setFinalScreen(false)
    setParagraph('')
    setHeading('')
    setGridImage([])
    setSeenIn([])
    setSeenInpre([])

  }


  console.log('heading ..........',heading)
  console.log('paragraph ..........',paragraph)

  /********************************************************************/
  /********************************************************************/
  /********************************************************************/



  return (
    <Grid gap={'xs'}>
      <div className={`overlayContainer ${loader ? 'active' : ''}`}>
        <Spinner />
      </div>


      {/* ========================================================================= */}
      {/* =============================    Inital Screen    ======================= */}
      {/* ========================================================================= */}

      {pairs.map((vl, key) => {
        const allP = JSON.parse(vl.pairdata)
        return (
          <>
            <Grid.Cell
              key={key}
              columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}
            >
              <div className="main-edit-outer">
                <Card title={vl.title} sectioned>
                  <Columns>
                    {allP.map((cVL, cKEY) => {
                      return (
                        <>
                          <Tooltip active content={cVL.title}>
                            <Text variant="bodyMd" fontWeight="bold" as="span">
                              <Columns columns={{ xs: '2fr 2fr',md: '2fr 2fr',
                                            }} > 
                               
                                  <Link
                                    href={'#'}
                                    onClick={(e) =>
                                      deleteAction(e, cKEY, cVL.handle, allP)
                                    }
                                  >
                                    <Icon source={DeleteMajor} color="base" />
                                  </Link>

                                  <Link
                                    href={'#'}
                                    onClick={(e) =>
                                      editAction(e, cKEY, cVL.handle, allP)
                                    }
                                  >
                                   <Icon source={EditMajor} color="base" />
                                 </Link>

                              </Columns>
                             

                              
                              <img
                                key={`images-${cKEY}`}
                                src={cVL?.images?.edges[0]?.node.originalSrc}
                                height={100}
                                width={100}
                                alt={vl.title}
                                style={{'marginTop':'10px'}}
                              />
                            </Text>
                          </Tooltip>
                        </>
                      )
                    })}

                    <Tooltip active content="">
                      <Text variant="bodyMd" fontWeight="bold" as="span">
                        <Link href={'#'} onClick={() => add_product_showArea()}>
                          <Icon source={AddMajor} color="base" />
                        </Link>
                      </Text>
                    </Tooltip>
                  </Columns>
                </Card>
              </div>
            </Grid.Cell>
          </>
        )
      })}


      {/* ========================================================================= */}
      {/* =============================== show search area ======================== */}
      {/* ========================================================================= */}
      

      {addproductshowArea === true && (
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
                  helpText={<span>&nbsp;</span>}
                  />
              </FormLayout>
            </Form>

            <Grid>
              {product.map((elements, index) => {
                return (
                  <Grid.Cell
                  key={index}
                  columnSpan={{ xs: 4, sm: 4, md: 4, lg: 4, xl: 4 }}
                  >
                    <div
                      onClick={(e) =>
                        select_product(
                          e,
                          elements.node,
                          elements.node?.id.match(/\d/g),
                          )
                        }
                        className={`tmb_grid ${
                          selectedDiv === elements.node?.id.match(/\d/g).join('')
                          ? 'activeClass'
                          : ''
                        }`}
                        >
                      <Card title={elements.node.title} sectioned>
                        <img
                          src={
                            elements.node?.images?.edges[0]?.node.originalSrc
                          }
                          height="90px"
                          />
                      </Card>
                    </div>
                  </Grid.Cell>
                )
              })}
            </Grid>
          </Card>
        </Grid.Cell>
      )}

      {/* ========================================================================= */}
      {/* =============================== Show Final step ======================== */}
      {/* ========================================================================= */}

     
      

      
      { (finalScreen === true) && selectedProduct.map((val, key) => (
        <> 
               
                    
                  <Grid.Cell key={`sl_${key}`} columnSpan={{xs: 6, sm:6, md: 6, lg: 6, xl: 6}}>
                  <Card title={val.title} sectioned >
                    
                    
                    <Grid> 
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
                    </Grid>

                    <div style={{'height' : '30px'}}></div>


                        
                        <img src={val?.images?.edges[0]?.node.originalSrc} height="90px" />
                        { (selectedThumbs[key] !== undefined) &&
                        <>
                          <img src={selectedThumbs[key]?.image?.originalSrc} height="90px" />
                        </>
                        }
                        <button  onClick={(e) => handleChange(e,key)}>{ (selectedThumbs[key]?.image?.originalSrc !== undefined) ? 'Change' : 'Add'}</button>
                        

                        { (selectedProduct.length > 0) && (
                  <PageActions
                  primaryAction={{
                      content: editUpdata ? 'Update' : 'Save',
                      onAction : editUpdata ? updatePairs : savepairs
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
              </>
            ))
       }

      




      <GalleryModal active={modalController} handleChange={handleChange} selectImages={selectImages} imageFor={imageFor} />

    </Grid>
  )
}

export default Index
