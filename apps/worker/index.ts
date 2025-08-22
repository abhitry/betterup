import { xAckBulk,xReadGroup } from "redisstream/client";
import axios from "axios";
import { prismaClient } from "store/client";
import { resolve } from "bun";

const REGION_ID = process.env.REGION_ID!;
const WORKER_ID = process.env.WORKER_ID!;

if(!REGION_ID)throw new Error("Region not provided");
if(!WORKER_ID)throw new Error(" Worker not provided")

async function main() {
  while(1) {
    // read from the stream
    const response=await xReadGroup(REGION_ID,WORKER_ID)
    if(!response){
        continue;
    }
    let promises=response.map(({message})=>fetchWebsite(message.url,message.id))
    await Promise.all(promises);
    console.log(promises.length);

    // process the website and store the result in the DB. TODO: It should probably
    // be routed through a queue in a bulk DB request.


    //ack back in the queue that the event has been preocessed
    xAckBulk(REGION_ID,response.map(({id})=>id));
  }
}

async function fetchWebsite(url:string,websiteId:string) {
    return new Promise<void>((resolve,reject)=>{
            let startTime=Date.now();
            axios.get(url)
                .then(async()=>{
                    const endTime=Date.now();
                    await prismaClient.websiteTick.create({
                        data:{
                            response_time_ms: endTime-startTime,
                            status: "Up",
                            region_id:REGION_ID,
                            website_id:websiteId
                        }
                    })
                    resolve();
                })
                .catch(async()=>{
                    const endTime=Date.now();
                    await prismaClient.websiteTick.create({
                        data:{
                            response_time_ms: endTime-startTime,
                            status: "Down",
                            region_id:REGION_ID,
                            website_id:websiteId
                        }  
                    })
                    resolve();
                })
        })   
}


main();