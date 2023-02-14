import {Button, Grid, Modal, TextContainer, TextField, Card, Thumbnail, Columns, Spinner, Text} from '@shopify/polaris';
import {useState, useCallback, useEffect} from 'react';
import gql from "graphql-tag";

import { GETMEDIAS } from '../libs/gql_query';
import client from '../config/client';
import { searchFiels } from '../libs/core';


 const GalleryModal = (props) => {
    const [searchTerm , setSearchterm] = useState('')
    const [media, setMedia] = useState([])
    const [loader, setLoader] = useState(false)
    const [active, setActive] = useState(0)
    const [image , setImage] = useState('')
    
    useEffect(() => {
        ;(async () => {
            let keyword = GETMEDIAS
            if(searchTerm !== ''){
                setLoader(true)
                keyword =  GETMEDIAS.replace('first:250',`first:250, query: "filename:${searchTerm}*"`)
            }
            // console.log('keyword ::::: ',keyword)

            const result = await searchFiels(keyword);
            console.log('result files : ',result)
            setMedia(result?.data?.files?.edges)
            setLoader(false)

        })().catch((error) => {
            console.log(error)
        })
    },[searchTerm])  
    

    const setActiveImage = (key,img) => {
        setActive(key)
        setImage(img)
    }



    return (
        <div style={{height: '500px'}}>
        <Modal
            // activator={activator}
            large
            open={props.active}
            onClose={props.handleChange}
            title="Search & select Images....."
            primaryAction={{
            content: 'Select Image',
            onAction: () => {
                props.selectImages(props.imageFor,image)
                props.handleChange()
            },
            }}
            
        >
            <Modal.Section>
            <TextContainer>
                    <Grid>
                        <Grid.Cell columnSpan={{xs: 12, sm: 12, md: 12, lg: 12, xl: 12}}>
                            <Card title="Search Image By Name" sectioned>
                                <TextField
                                    value={searchTerm}
                                    onChange={(e) => setSearchterm(e)}
                                    type="text"
                                    autoComplete="email"
                                    />
                            </Card>
                        </Grid.Cell>
                        <Grid.Cell columnSpan={{xs: 12, sm: 12, md: 12, lg: 12, xl: 12}}>
                                <Columns>
                                    { loader && (<Spinner accessibilityLabel="Spinner example" size="large" />)}
                                    { media.map((value, key) => {
                                        let imgeUrl = value.node.image.originalSrc.split('?')
                                        imgeUrl = imgeUrl[0]?.split('/').slice(-1).pop().replaceAll('-',' ').replaceAll('_',' ').split('.')[0]
                                         return   (<>
                                               <div  key={`galleryImg_${key}`}>
                                                <a href='#' onClick={(e) => setActiveImage(key,value.node)} className={'media_selected_case '+((active === key) ? 'active' : '' )} >
                                                    <Thumbnail 
                                                            source={value.node.image.originalSrc}
                                                            alt="Black choker necklace"
                                                            size="large"
                                                    />
                                                </a>
                                                <p>{imgeUrl}</p>
                                                </div>
                                            </>)
                                        })
                                    }
                                </Columns>
                                {
                                    (media.length === 0) && <>
                                    <Card sectioned >
                                        <Text variant='heading2xl' as='h3' alignment='center'>Search Results for: "{searchTerm}"</Text>
                                        <Text variant='bodyLg' alignment='center' as='p' style={{mrginTop : '100px'}}>It seems we can't find what you're looking for.</Text>
                                    </Card>
                                    </>
                                }
                        </Grid.Cell>
                    </Grid>
            </TextContainer>
            </Modal.Section>
        </Modal>
        </div>
    );
}

export default GalleryModal