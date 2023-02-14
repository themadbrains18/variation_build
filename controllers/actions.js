const { Op } = require("sequelize");
const { db } = require("../models");

const savePair  = async (ctx) => {
    const { shop, accessToken } = ctx.session;   
    if (shop && accessToken) {
       const {ids,pairdata, actualdata,title,heading,paragraph} = JSON.parse(ctx.request.body) 
       let newPair  = await db.pairs.create(
        {
          domain : shop,
          ids : ids, 
          pairdata: JSON.stringify(pairdata), 
          actualdata : JSON.stringify(actualdata),
          title : title, 
          heading : heading, 
          paragraph : paragraph, 
        })
       ctx.body = {
        status: 200,
        message: "SuccessFully added",
        data : newPair
      };
    }else{
      ctx.body = {
        status: 500,
        message: "Invalid access",
      };
    }
} 


//

const updatepair = async (ctx) => {
  const { shop, accessToken } = ctx.session;   
  if (shop && accessToken) {
    const {slug} = ctx.params
    console.log(slug,ctx.params, ' ====================') 
    const overAllData = JSON.parse(ctx.request.body) 

    let condition = {where : {id : `${slug}`}}
    let option = { multi: true }

    const newData = await  db.pairs.update(
      overAllData,
      condition
    )

    const getData = await db.pairs.findOne({where : { id : `${slug}`}})

    ctx.body = {
      status: 200,
      message: "Updated data....",
      slug : newData,
      data : getData,
    };
  }else{
    ctx.body = {
      status: 500,
      message: "Invalid access",
    };
  }
}


const exitingRecord  = async (ctx) => {
  const { shop, accessToken } = ctx.session;   
// asdasd  asdasd asd asdasd
  if (shop && accessToken) {
     let reqst = JSON.parse(ctx.request.body)
     console.log(reqst.id)
     let existing  = await db.pairs.findOne({
       where : {
        domain : shop,
        ids : {
          [Op.like] : `%${reqst.id}%` 
        }
      }
      })

     ctx.body = {
      status: 200,
      message: "existing records",
      data : existing
    };
  }else{
    ctx.body = {
      status: 500,
      message: "Invalid access",
    };
  }
} 



// 

const getallpair = async (ctx) => {
    const { shop, accessToken } = ctx.session;   
    if (shop && accessToken) {
        const  getAllPais = await db.pairs.findAll({});

        ctx.body = {
          status: 200,
          message: "fetching records",
          data : getAllPais
        };
    }else{
      ctx.body = {
        status: 500,
        message: "Invalid access",
      };
    }
}

// /api/get-all-pair

const getsinglepair = async (ctx) => {
  const { shop, accessToken } = ctx.session;   
  if (shop && accessToken) {
    const {slug} = ctx.params
    const  getAllPais = await db.pairs.findOne({ where : {id : slug}});

    ctx.body = {
      status: 200,
      message: "Invalid access",
      data : getAllPais
    };

  }else{
    ctx.body = {
      status: 500,
      message: "Invalid access",
    };
  }
}

const deletePair = async (ctx) => {
    const { shop, accessToken } = ctx.session;   
    if (shop && accessToken) {
      const {slug} = ctx.params
      await db.pairs.destroy({ where : {id : slug}});
      const  getAllPais = await db.pairs.findAll({});
      ctx.body = {
        status: 200,
        message: "Invalid access",
        data : getAllPais
      };
    }else{
      ctx.body = {
        status: 500,
        message: "Invalid access",
      };
    }
}

module.exports =  {
    savePair,
    exitingRecord,
    getallpair,
    getsinglepair,
    updatepair,
    deletePair
}