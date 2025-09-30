import dotenv from 'dotenv';
dotenv.config();

export const getTokenURL= async (symbol:string, targetSymbols:string)=>{
    const baseUrl = 'https://min-api.cryptocompare.com/data/price';
const params = {"tsyms":targetSymbols,"fsym":symbol,"tryConversion":true,"relaxedValidation":true,"sign":true};
const url = new URL(baseUrl);
url.search = new URLSearchParams(params as unknown as Record<string, string>).toString();

   const cryptoPriceTickerRequest = await fetch(`${url}`, {
        headers:{
            'Content-Type': 'application/json; charset=UTF-8',
            'X-Api-Key':process.env.COINDESK_API_KEY as string,
        }
    });
    const cryptoPriceTicker = await cryptoPriceTickerRequest.json();
    return cryptoPriceTicker;
}