import { createClient } from "redis";
const STREAM_NAME="betteruptime:website";

const client = await createClient()
  .on("error", (err) => console.log("Redis Client Error", err))
  .connect();

type WebsiteEvent = {url: string, id: string}
type MessageType={
    id:string,
    message:{
      url:string,
      id:string
    }
  }

async function xAdd({url, id}: WebsiteEvent) {
  await client.xAdd(
    STREAM_NAME, '*', {
        url,
        id
    }
  );
}

export async function xAddBulk(websites: WebsiteEvent[]) {
  for (let i = 0; i < websites.length; i++) {
    await xAdd({
      url: websites[i].url,
      id: websites[i].id
    })
  }
}

export async function xReadGroup(consumerGroup: string,workerId:string): Promise<MessageType[] | undefined> {
   const res = await client.xReadGroup(
    consumerGroup, // group name
    workerId,      // consumer name
    [
      {
        key: STREAM_NAME,
        id: ">", // read new messages
      },
    ],
    {
      COUNT: 500,
      BLOCK: 5000, // optional: wait for messages up to 5s
    }
  );
  //@ts-ignore
  let messages:MessageType[]|undefined=res?.[0]?.messages;

  return messages;
}

async function xAck(consumerGroup: string,eventId:string) {
    const res22=await client.xAck(STREAM_NAME,consumerGroup,eventId)
}

export async function xAckBulk(consumerGroup: string,eventId:string[]) {
  eventId.map(eventId=>xAck(consumerGroup,eventId));
}